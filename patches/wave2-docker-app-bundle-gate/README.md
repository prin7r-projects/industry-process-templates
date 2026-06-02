# wave2-docker-app-bundle-gate

## Scope

This patch package brings the **VerticalPlaybook Wave 2 Docker / deploy
packaging** into the AGENTS-compliant patch policy used elsewhere in the
Prin7r monorepo (see `outbound-sales-machines/patches/compose-optional-env-file/`
for the reference shape).

It is scoped to **only** the Docker-related changes needed to ship the
Wasp open-saas app (`apps/app/`) as a container alongside the already-shipping
landing (`Dockerfile.landing`):

1. A new, repository-rooted `apps/app/Dockerfile.app` — a multistage
   Node 24 / Wasp 0.23 / Prisma image that builds the Wasp app, generates
   the Prisma client, and ships a non-root `npm run start-production` entry.
2. A re-pointed `app` service in `docker-compose.yml`:
   - `build.context` flips from `./apps/app` to `.` (repo root)
   - `build.dockerfile` flips from `Dockerfile` to `apps/app/Dockerfile.app`
   - The service gains the inline `environment:` block (DATABASE_URL,
     REDIS_URL, S3_ENDPOINT, S3_FORCE_PATH_STYLE, WASP_*_URL, PORT) the
     Wasp server reads at boot, and the multi-host Traefik labels.
3. A `traefik` + `internal` `networks:` block on every service that needs
   it, plus a top-level `networks:` declaration that marks `traefik` as
   external and defines a private `internal` network for the data plane
   (postgres / redis / minio ↔ app).

**Out of scope** (intentionally not touched by this patch):

- The Wasp `main.wasp` SMTP change (`Dummy` → `SMTP`).
- The `pnpm-workspace.yaml` `allowBuilds:` and `minimumReleaseAgeExclude:`
  carve-out.
- The root `package.json` script renames (`pnpm -F app` → `pnpm --dir apps/app`).
- The `seed:templates` script in `apps/app/package.json` and
  `apps/app/src/server/scripts/templateSeed.ts`.
- The new Radix `tabs` UI primitive.
- The new `apps/app/src/templates/` vertical-request pages and
  `tabs.tsx` — these are application-code, not Docker packaging.

These are tracked separately under the Wave 3 application-code work and
will be packaged under their own patches when they graduate.

## Rationale

PRI-3496 succeeded: the bundle build pipeline (`pnpm bundle:build:all`)
produces versioned `.zip` artifacts for all three verticals. PRI-3516 is
the follow-up that **brings Docker / deploy packaging into the same
patch policy** as the rest of Prin7r, and runs the full
app/bundle gate against the dirty working tree.

The dirty changes on `main` as of this heartbeat are:

- `M docker-compose.yml` — needs to land in the repo.
- `?? apps/app/Dockerfile.app` — new file, also needs to land.

Both must be packaged under a single `patches/<patch-id>/` directory
with exactly `README.md` (this file) and `apply.*` (the shell script).
Per the AGENTS policy referenced above, the apply script must be
**idempotent** — running it against an already-patched working tree
must exit 0 and leave the file contents byte-stable. The script must
also **refuse to silently rewrite an unrelated configuration** — if the
working tree shape is neither "pre-patch" nor "already-patched", the
script exits 1 with a clear error.

## Contents

- `README.md` — this file
- `apply.sh` — the patch applier (idempotent, safe to re-run, refuses
  partial / mixed shapes)

## What `apply.sh` does

The script is state-machine driven. It classifies the working tree into
one of three states by **counting the relevant lines / files**:

- `ALREADY_PATCHED` (everything matches the expected post-state) →
  prints a one-line summary, leaves the tree untouched, **exits 0**.
  This is the rerun path.
- `PRE_PATCH` (working tree matches the clean `HEAD` state) → runs the
  rewrite, then re-verifies the post-state shape, **exits 0** on success.
- `UNEXPECTED` (partial / mixed shape, e.g. only the Dockerfile is in
  place but `docker-compose.yml` is unmodified, or vice versa) → prints
  the observed counts, leaves the tree untouched, **exits 1**. The
  script will not silently rewrite something it doesn't recognize.

For the `docker-compose.yml` rewrite, the script uses POSIX `awk` to
apply two small, targeted transforms:

1. **Re-point the `app` service build context.** The pair
   ```yaml
   build:
     context: ./apps/app
     dockerfile: Dockerfile
   ```
   becomes
   ```yaml
   build:
     context: .
     dockerfile: apps/app/Dockerfile.app
   ```
   The awk pattern is anchored to the `app` service block by checking
   the line immediately following `dockerfile: Dockerfile` for the
   `container_name: industry-process-templates-app` marker.

2. **Add `networks:` blocks to every service that needs one, plus a
   top-level `networks:` declaration.** The script walks the file and
   inserts the appropriate `networks:` list (a) directly under the
   `expose:` block of the affected services, and (b) as the final
   block in the file.

For the `apps/app/Dockerfile.app` file, the script **embeds the
expected file content as a heredoc** and writes it byte-for-byte on
first run. On rerun, it compares the on-disk file's content to the
embedded expected content; if they match, no write happens.

The script does **not** perform any direct string replacement against
an existing Dockerfile (per the AGENTS rule). The Dockerfile is a
*new file* the script authors, not a modification of an existing one.

## Why a new Dockerfile (not a string replace)

The new Wasp app image is a multistage build that:

- Installs the Wasp 0.23 CLI on the builder stage.
- Copies `apps/app/`, `bundles/`, and `scripts/` into the build context
  (because Wasp's `wasp build` reads from `apps/app/` and the bundle
  build pipeline needs the `bundles/` tree for the `npm run bundle`
  post-build step that ships bundled artifacts into the image).
- Generates the Prisma client against the Wasp-compiled `db/schema.prisma`.
- Copies only the production server bundle into the slim `runner` stage.

None of this maps cleanly onto a "modify the existing Dockerfile in
place" string replacement. The cleanest representation is a fresh
file under the new path (`apps/app/Dockerfile.app`), authored whole by
the apply script. This is the explicit "do not do direct Dockerfile
string replacement" carve-out: the script writes a *new* file at a
*new* path, it does not edit the existing `apps/app/Dockerfile` (which
does not exist in this repo — the prior `Dockerfile` reference in
`docker-compose.yml` was a stale Phase 0 placeholder).

## What the apply script does NOT do

- It does not run `pnpm install`, `pnpm build:landing`, or
  `pnpm bundle:build:all`. Those are the **app/bundle gate** and are
  invoked separately by the supervisor after the patch lands, per the
  PRI-3516 issue scope.
- It does not run `docker compose config --quiet`. Docker is **not
  available in the Paperclip build environment** for this project (it
  is unavailable in the droid runtime here, see PRI-3516 blocker note).
  The supervisor / production deploy step owns compose validation.
- It does not commit anything. The apply script writes the working
  tree only; the supervisor decides when to commit.

## Required runtime secrets (unchanged)

The patch is additive with respect to runtime secrets. The `.env`
template (`.env.example`) at the repo root lists every variable the
running containers expect. None of these are created or stubbed by
the patch:

- `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` (landing)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (postgres)
- `REDIS_PASSWORD` (redis)
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` (minio)
- `ADMIN_EMAILS`, `DELIVERY_SIGNING_KEY`, `ADMIN_API_KEY`,
  `AWS_S3_IAM_ACCESS_KEY`, `AWS_S3_IAM_SECRET_KEY` (app)
- `SMTP_*` (Wasp email sender — used at runtime, not at compose time)

Operators must provision the live `.env` on the host per
`README.md` → "Production deploy".

## Verification

After running the script, verify with:

```bash
# 1. The apply script itself exits 0 on rerun (idempotency).
sh patches/wave2-docker-app-bundle-gate/apply.sh

# 2. The working tree state matches what the patch describes.
git status --porcelain
git diff -- docker-compose.yml

# 3. If docker is available, validate the compose file.
docker compose config --quiet && echo OK
```

On hosts without `docker`, leave compose validation to the supervisor
/ Paperclip provisioning step. On hosts without `wasp` (e.g. the
Paperclip droid build environment), leave `wasp build` to the
production deploy pipeline.

## App/bundle gate (per PRI-3516)

Per the issue scope, the following gates are run by the supervisor
**after** the patch lands. The exit codes are recorded into the issue
comment so the next heartbeat has concrete evidence:

| Gate | Command | Expected exit |
|------|---------|---------------|
| Working tree | `git status --porcelain` | 0 |
| Frozen-lockfile install | `pnpm install --frozen-lockfile` | 0 |
| Landing build | `pnpm build:landing` | 0 |
| Bundle build (all) | `pnpm bundle:build:all` | 0 |
| Compose config | `docker compose config --quiet` | 0 *(deferred — docker not in this env)* |
| Wasp app build | `pnpm -F app build` | TBD *(blocked — wasp CLI not in this env)* |

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-06-02 | Initial patch — adds `apps/app/Dockerfile.app`, re-points `app` service in `docker-compose.yml` to the new build context, adds `traefik` + `internal` network wiring. Tracks PRI-3516 (follow-up to PRI-3496). | Droid M3 Engineer #10 |
