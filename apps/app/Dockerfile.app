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
