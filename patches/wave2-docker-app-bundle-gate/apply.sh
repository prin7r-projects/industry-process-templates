#!/bin/sh
# patches/wave2-docker-app-bundle-gate/apply.sh
#
# Lands the Wave 2 Docker / deploy packaging changes for the
# VerticalPlaybook Wasp app:
#
#   1. Adds a new apps/app/Dockerfile.app (multistage Wasp 0.23 image).
#      Per the AGENTS rule, this Dockerfile is a NEW file the apply
#      script authors whole — it is not a string-replace of an existing
#      file.
#   2. Re-points the `app` service in docker-compose.yml to the new
#      Dockerfile at the new context, and adds the inline
#      `environment:` block + multi-host Traefik labels the Wasp server
#      reads at boot.
#   3. Wires up `networks:` blocks on every service that needs one,
#      plus a top-level `networks:` declaration that marks `traefik`
#      as external and defines a private `internal` network.
#
# Idempotent. Safe to re-run. The script classifies the working tree
# into PRE_PATCH / ALREADY_PATCHED / UNEXPECTED by SHA-256 fingerprint
# of the two target files (docker-compose.yml, apps/app/Dockerfile.app).
# It refuses partial or mixed shapes so we never silently rewrite an
# unrelated configuration.
#
# Implementation note: docker-compose.yml is authored as a single heredoc
# (the post-state is the only canonical form we care about). SHA-256
# checks before and after guarantee the file lands in the expected
# shape and the script refuses to silently rewrite something different.
#
# Usage (from repo root):
#   sh patches/wave2-docker-app-bundle-gate/apply.sh

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/../.." && pwd)
COMPOSE_FILE="${REPO_ROOT}/docker-compose.yml"
DOCKERFILE="${REPO_ROOT}/apps/app/Dockerfile.app"

# --- Expected fingerprints --------------------------------------------------
#
# PRE_PATCH_COMPOSE_SHA is the SHA-256 of the file content at HEAD on main.
# POST_PATCH_COMPOSE_SHA is the SHA-256 of the post-state heredoc below.
# POST_PATCH_DOCKERFILE_SHA is the SHA-256 of the post-state heredoc below.
#
# If you edit either target file, recompute with:
#     git show HEAD:docker-compose.yml | sha256sum
#     sha256sum docker-compose.yml
#     sha256sum apps/app/Dockerfile.app
#
PRE_COMPOSE_SHA=83d80acfc956af774cfb8d1f7f62ca5f3100581a9776fd92f7b1ed682df32961
POST_COMPOSE_SHA=7fcdf9a69c4e6941901519915bcaa215f26c7ebcc709ff79a07510cdd6c38700
POST_DOCKERFILE_SHA=cc4f6c2fd725d6e60caf68396f9c150645820a0bdf12e5be7fd2d8fa0e2f77cb

sha256_of() {
    sha256sum "$1" 2>/dev/null | awk '{print $1}'
}

if [ ! -f "${COMPOSE_FILE}" ]; then
    printf 'apply.sh: error: %s not found\n' "${COMPOSE_FILE}" >&2
    exit 1
fi

CURRENT_COMPOSE_SHA=$(sha256_of "${COMPOSE_FILE}")

if [ -f "${DOCKERFILE}" ]; then
    CURRENT_DOCKERFILE_SHA=$(sha256_of "${DOCKERFILE}")
else
    CURRENT_DOCKERFILE_SHA=MISSING
fi

# --- State detection --------------------------------------------------------
# State: ALREADY_PATCHED. Both fingerprints match the expected post-state.
# Idempotent no-op success.
if [ "${CURRENT_COMPOSE_SHA}" = "${POST_COMPOSE_SHA}" ] \
    && [ "${CURRENT_DOCKERFILE_SHA}" = "${POST_DOCKERFILE_SHA}" ]; then
    printf 'apply.sh: OK - already patched (no changes needed).\n'
    printf 'apply.sh: docker-compose.yml SHA: %s\n' "${CURRENT_COMPOSE_SHA}"
    printf 'apply.sh: apps/app/Dockerfile.app SHA: %s\n' \
        "${CURRENT_DOCKERFILE_SHA}"
    exit 0
fi

# State: PRE_PATCH. Compose matches HEAD (or compose is in any non-POST
# state and we will simply overwrite it), and Dockerfile is missing.
# Run the rewrite.
if [ "${CURRENT_COMPOSE_SHA}" = "${PRE_COMPOSE_SHA}" ] \
    && [ "${CURRENT_DOCKERFILE_SHA}" = "MISSING" ]; then
    : # fall through into the rewrite block
else
    # State: UNEXPECTED. Refuse with a clear error.
    printf 'apply.sh: error: unexpected shape in working tree.\n' >&2
    printf '  docker-compose.yml SHA: %s\n' >&2 "${CURRENT_COMPOSE_SHA}"
    printf '  apps/app/Dockerfile.app SHA: %s\n' >&2 "${CURRENT_DOCKERFILE_SHA}"
    printf '  expected (pre):  compose=%s dockerfile=MISSING\n' >&2 \
        "${PRE_COMPOSE_SHA}"
    printf '  expected (post): compose=%s dockerfile=%s\n' >&2 \
        "${POST_COMPOSE_SHA}" "${POST_DOCKERFILE_SHA}"
    printf 'apply.sh: refusing to patch an unexpected configuration.\n' >&2
    printf 'apply.sh: if you intentionally edited these files, update the\n' >&2
    printf 'apply.sh: expected SHAs in this script and the README.md.\n' >&2
    exit 1
fi

# --- Write: apps/app/Dockerfile.app -----------------------------------------
# Per the AGENTS rule, this is a brand-new file authored whole by the
# apply script. We never string-replace an existing Dockerfile.
mkdir -p "$(dirname "${DOCKERFILE}")"
cat > "${DOCKERFILE}" <<'DOCKERFILE_EOF'
FROM node:24-bookworm-slim AS builder

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /repo
COPY apps/app /repo/apps/app
COPY bundles /repo/bundles
COPY scripts /repo/scripts

WORKDIR /repo/apps/app
RUN npm install -g @wasp.sh/wasp-cli@0.23.0 @wasp.sh/wasp-cli-linux-x64-glibc@0.23.0
RUN rm -f package-lock.json && npm install --include=dev
RUN wasp build

WORKDIR /repo/apps/app/.wasp/out
RUN npm install \
    && cd server \
    && npm install \
    && npx prisma generate --schema='../db/schema.prisma' \
    && npm run bundle

FROM node:24-bookworm-slim AS runner

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

COPY --from=builder /repo/apps/app/.wasp/out/node_modules /app/node_modules
COPY --from=builder /repo/apps/app/.wasp/out/server/node_modules /app/.wasp/out/server/node_modules
COPY --from=builder /repo/apps/app/.wasp/out/server/bundle /app/.wasp/out/server/bundle
COPY --from=builder /repo/apps/app/.wasp/out/server/package*.json /app/.wasp/out/server/
COPY --from=builder /repo/apps/app/.wasp/out/db /app/.wasp/out/db
COPY --from=builder /repo/bundles /app/bundles

EXPOSE 3001
WORKDIR /app/.wasp/out/server
ENTRYPOINT ["npm", "run", "start-production"]
DOCKERFILE_EOF

ACTUAL_DOCKERFILE_SHA=$(sha256_of "${DOCKERFILE}")
if [ "${ACTUAL_DOCKERFILE_SHA}" != "${POST_DOCKERFILE_SHA}" ]; then
    printf 'apply.sh: error: post-write Dockerfile SHA mismatch.\n' >&2
    printf '  expected: %s\n' >&2 "${POST_DOCKERFILE_SHA}"
    printf '  got:      %s\n' >&2 "${ACTUAL_DOCKERFILE_SHA}"
    exit 1
fi

# --- Write: docker-compose.yml ---------------------------------------------
# Author the post-state as a single heredoc. The post-state is the only
# canonical form we care about; SHA-256 checks before and after guarantee
# the file lands in the expected shape. The rewrite is unconditional in
# the PRE_PATCH state: we do not try to apply a partial patch to a
# partially-patched file (we already exited 1 for that case above).
cat > "${COMPOSE_FILE}" <<'COMPOSE_EOF'
services:
  # --- Wave 2 Landing (Next.js 15, already shipped) ---
  landing:
    build:
      context: .
      dockerfile: Dockerfile.landing
    container_name: industry-process-templates-landing
    restart: unless-stopped
    env_file:
      - .env
    expose:
      - "3000"
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.industry-process-templates.rule=Host(`industry-process-templates.prin7r.com`)"
      - "traefik.http.routers.industry-process-templates.entrypoints=websecure"
      - "traefik.http.routers.industry-process-templates.tls=true"
      - "traefik.http.routers.industry-process-templates.tls.certresolver=letsencrypt"
      - "traefik.http.services.industry-process-templates.loadbalancer.server.port=3000"

  # --- Wave 3 App (Wasp open-saas fork, Phase 0 scaffold) ---
  app:
    build:
      context: .
      dockerfile: apps/app/Dockerfile.app
    image: verticalplaybook-app:latest
    container_name: industry-process-templates-app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-verticalplaybook}
      REDIS_URL: redis://:${REDIS_PASSWORD:-redispass}@redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_FORCE_PATH_STYLE: "true"
      WASP_WEB_CLIENT_URL: https://verticalplaybook.prin7r-app.com
      WASP_SERVER_URL: https://verticalplaybook.prin7r-app.com
      PORT: "3001"
    expose:
      - "3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - traefik
      - internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.industry-process-templates-app.rule=Host(`app.industry-process-templates.prin7r.com`) || Host(`verticalplaybook.prin7r-app.com`)"
      - "traefik.http.routers.industry-process-templates-app.entrypoints=websecure"
      - "traefik.http.routers.industry-process-templates-app.tls=true"
      - "traefik.http.routers.industry-process-templates-app.tls.certresolver=letsencrypt"
      - "traefik.http.routers.industry-process-templates-app.priority=50"
      - "traefik.http.services.industry-process-templates-app.loadbalancer.server.port=3001"

  # --- Postgres 16 ---
  postgres:
    image: postgres:16-alpine
    container_name: verticalplaybook-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-verticalplaybook}
    expose:
      - "5432"
    networks:
      - internal
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-verticalplaybook}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # --- Redis 7 (BullMQ queue store + ephemeral cache) ---
  redis:
    image: redis:7-alpine
    container_name: verticalplaybook-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-redispass} --appendonly yes
    expose:
      - "6379"
    networks:
      - internal
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD-SHELL", "redis-cli -a \"$${REDIS_PASSWORD:-redispass}\" --raw incr ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # --- MinIO (S3-compatible object storage for bundle .zip artifacts) ---
  minio:
    image: minio/minio:latest
    container_name: verticalplaybook-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    expose:
      - "9000"
      - "9001"
    networks:
      - traefik
      - internal
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.verticalplaybook-minio.rule=Host(`minio.industry-process-templates.prin7r.com`)"
      - "traefik.http.routers.verticalplaybook-minio.entrypoints=websecure"
      - "traefik.http.routers.verticalplaybook-minio.tls=true"
      - "traefik.http.routers.verticalplaybook-minio.tls.certresolver=letsencrypt"
      - "traefik.http.services.verticalplaybook-minio.loadbalancer.server.port=9001"

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local

networks:
  traefik:
    external: true
  internal:
COMPOSE_EOF

ACTUAL_COMPOSE_SHA=$(sha256_of "${COMPOSE_FILE}")
if [ "${ACTUAL_COMPOSE_SHA}" != "${POST_COMPOSE_SHA}" ]; then
    printf 'apply.sh: error: post-write compose SHA mismatch.\n' >&2
    printf '  expected: %s\n' >&2 "${POST_COMPOSE_SHA}"
    printf '  got:      %s\n' >&2 "${ACTUAL_COMPOSE_SHA}"
    printf '  the heredoc did not match the expected post-state. This\n' >&2
    printf '  usually means the heredoc was edited in this script and\n' >&2
    printf '  is out of sync with POST_COMPOSE_SHA. Update both.\n' >&2
    exit 1
fi

printf 'apply.sh: OK - wrote apps/app/Dockerfile.app.\n'
printf 'apply.sh: OK - wrote docker-compose.yml (post-state).\n'
printf 'apply.sh: compose SHA: %s\n' "${ACTUAL_COMPOSE_SHA}"
printf 'apply.sh: dockerfile SHA: %s\n' "${ACTUAL_DOCKERFILE_SHA}"
