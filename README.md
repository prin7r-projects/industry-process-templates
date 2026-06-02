# VerticalPlaybook — `industry-process-templates`

> Operational architecture for the verticals that build the world.

A marketplace of vertical-specific operational bundles — SOPs, automations, n8n flows, and prompt packs — calibrated by industry and deployable in a day.

**Live:** [industry-process-templates.prin7r.com](https://industry-process-templates.prin7r.com)
**App (Phase 0):** Wasp open-saas fork in `apps/app/` (target: `app.industry-process-templates.prin7r.com`)
**Notion opportunity:** [Industry process templates](https://www.notion.so/Industry-process-templates-3543ceec26198166b90ac8df25836629)
**Wave:** Prin7r Wave 2/3 · 2026-05-08

---

## Repository layout

```
.
├── DESIGN.md                       # Canonical design + style guide (15 sections)
├── README.md                       # This file
├── LICENSE                         # MIT (code) — bundles separately licensed
├── Dockerfile.landing              # Multistage Next.js standalone image
├── docker-compose.yml              # Landing + App + Postgres + Redis + MinIO
├── .env.example                    # Public env shape — copy to .env on deploy
├── package.json                    # Root pnpm workspace
├── pnpm-workspace.yaml
├── .gitignore
├── .github/
│   └── workflows/
│       └── landing-build.yml       # Validates `next build` on PRs to main
├── apps/
│   ├── landing/                    # Next.js 15 + Tailwind + ShadCN — production landing
│   │   ├── app/                    # App Router pages + API routes
│   │   ├── components/             # Project-owned components
│   │   ├── components/ui/          # ShadCN primitives
│   │   └── lib/                    # env, signatures, tiers, verticals
│   └── app/                        # Wasp open-saas fork — VerticalPlaybook SaaS app
│       ├── main.wasp               # Wasp app definition (auth, routes, db)
│       ├── schema.prisma           # Database schema (Vertical, Bundle, BundleVersion, Template, Order, License, etc.)
│       ├── package.json
│       └── src/                    # React components, auth, operations
├── bundles/                        # Phase 0 authored bundles
│   ├── hvac-fall-startup/          # 28 SOPs, 14 automations, 9 n8n flows, 4 prompt packs
│   ├── marketing-agency-d1-30/     # 22 SOPs, 12 automations, 7 n8n flows, 3 prompt packs
│   └── accounting-year-end/        # 19 SOPs, 8 automations, 5 n8n flows, 5 prompt packs
├── data/bundles/                   # Built .zip files (gitignored)
├── scripts/                        # Bundle build + content generation scripts
│   ├── bundle-build.js             # pnpm -F app bundle:build <slug|all>
│   └── generate-bundle-content.js
└── docs/
    ├── 01-brand-identity.md
    ├── 02-architecture.md
    ├── 12-technical-specification.md
    ├── 13-implementation-plan.md
    ├── pitch-deck.html
    └── screenshots/
```

---

## Quick start (local dev)

### Landing (production-ready)

```bash
cd apps/landing
pnpm install
cp ../../.env.example .env.local
pnpm dev
# Open http://localhost:3000
```

### App (Wasp open-saas fork — Phase 0)

```bash
# Prerequisites: Wasp CLI (npx @wasp.sh/wasp-cli)
cd apps/app
npx wasp start db    # Start Postgres (terminal 1)
npx wasp db migrate-dev  # Run migrations (terminal 2)
npx wasp start       # Start Wasp dev server on :3001
```

Without env vars, the app starts with Dummy email provider (check server logs for verification links).

### Bundle Build

```bash
# Build all 3 bundles
pnpm -F app bundle:build all

# Build single bundle
pnpm -F app bundle:build hvac-fall-startup

# Output: data/bundles/<slug>-v<version>.zip
```

---

## Infrastructure (docker-compose)

Canonical posture: **POST state is committed** for both `docker-compose.yml`
and `apps/app/Dockerfile.app` (the Wave 2 Docker / deploy packaging landed
via the `patches/wave2-docker-app-bundle-gate/` patch package). Operators
do not need to run the apply script on a fresh clone.

The patch is preserved under `patches/wave2-docker-app-bundle-gate/` as a
defensive fallback: if a host is ever pinned to a `PRE`-patch revision
(older compose + no `apps/app/Dockerfile.app`), the operator may run the
idempotent applier to land the canonical POST state. The applier is
safe to re-run; a second invocation against an already-patched tree is
a no-op that exits 0.

```bash
# Optional fallback (not needed on a fresh clone of main):
sh patches/wave2-docker-app-bundle-gate/apply.sh
# Verify:
git status --porcelain
docker compose config --quiet && echo OK
```

```bash
docker compose up -d
```

Services:
| Service | Port | Purpose |
|---------|------|---------|
| `landing` | :3000 | Next.js 15 marketing surface + NOWPayments checkout |
| `app` | :3001 | Wasp open-saas app (auth, catalog, dashboard) |
| `postgres` | :5432 | Primary database (catalog, customers, licenses) |
| `redis` | :6379 | BullMQ queue store + ephemeral cache |
| `minio` | :9000/:9001 | S3-compatible object storage (bundle .zip artifacts) |

Traefik labels are configured for:
- `industry-process-templates.prin7r.com` → landing
- `app.industry-process-templates.prin7r.com` → app
- `minio.industry-process-templates.prin7r.com` → MinIO console

---

## Environment Variables

Copy `.env.example` to `.env` and populate:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL for redirects and webhooks |
| `NOWPAYMENTS_API_KEY` | Yes (landing) | NOWPayments API key |
| `NOWPAYMENTS_IPN_SECRET` | Yes (landing) | Webhook signature verification |
| `POSTGRES_USER/PASSWORD/DB` | Yes | Postgres credentials |
| `REDIS_PASSWORD` | Yes | Redis auth |
| `MINIO_ROOT_USER/PASSWORD` | Yes | MinIO S3 credentials |
| `AWS_S3_IAM_ACCESS_KEY` | Yes (app) | S3 access (set to MinIO creds locally) |
| `AWS_S3_IAM_SECRET_KEY` | Yes (app) | S3 secret |
| `ADMIN_EMAILS` | Yes (app) | Comma-separated admin email list |
| `DELIVERY_SIGNING_KEY` | Yes (app) | HMAC-SHA256 secret for download token signing |
| `ADMIN_API_KEY` | Yes (app) | Bearer auth key for admin endpoints (license revocation) |
| `S3_ENDPOINT` | No | MinIO/S3 endpoint override (default: AWS) |
| `S3_FORCE_PATH_STYLE` | No | Set `true` for MinIO path-style addressing |

Full list in `.env.example`.

---

## Bundles

| Bundle | Vertical | SOPs | Automations | n8n Flows | Prompt Packs | Size |
|--------|----------|------|-------------|-----------|-------------|------|
| [hvac-fall-startup](./bundles/hvac-fall-startup/) | HVAC | 28 | 14 | 9 | 4 | 1.14 MB |
| [marketing-agency-d1-30](./bundles/marketing-agency-d1-30/) | Marketing Agency | 22 | 12 | 7 | 3 | 1.30 MB |
| [accounting-year-end](./bundles/accounting-year-end/) | Accounting | 19 | 8 | 5 | 5 | 1.36 MB |

Each bundle directory contains: `manifest.json`, `sops/*.md`, `automations/*.json`, `n8n-flows/*.json`, `prompt-packs/*.md`, `templates/*.md`.

---

## Catalog API (Phase 1)

Public REST API for browsing verticals and bundles. No auth required.

Base URL: `https://app.industry-process-templates.prin7r.com/api/v1`

| Endpoint | Method | Description |
|---|---|---|
| `/catalog/verticals` | GET | List all verticals with summary counts |
| `/catalog/verticals/:slug` | GET | Single vertical with bundles + sample SOPs |
| `/catalog/verticals/:slug/bundles` | GET | Bundle summaries for a vertical |
| `/catalog/bundles/:slug` | GET | Full bundle manifest + version + pricing + fit definition |
| `/catalog/bundles/:slug/versions` | GET | All published versions for a bundle |

All catalog endpoints include `Cache-Control: public, max-age=300, stale-while-revalidate=900`.

Response shape (all endpoints): `{ data, error }`. Error objects include a stable `error.code` string.

### License & Delivery Flow

**Issue license** (on verified payment):
```
POST /api/v1/licenses/issue
Body: { orderId, bundleVersionId, licenseKind? }
→ { licenseKey, downloadToken, downloadUrl, expiresAt }
```

**Download bundle** (single-use token):
```
GET /api/v1/delivery/:tokenId
→ Streams bundle .zip from S3 (Phase 3)
→ 410 Gone on second use or expired token
→ 403 Forbidden if license revoked
```

**Refresh download token**:
```
POST /api/v1/delivery/refresh-token
Body: { licenseId }
→ Mints fresh 24h download token
```

**Revoke license** (admin):
```
POST /api/v1/admin/licenses/:licenseId/revoke
Authorization: Bearer <ADMIN_API_KEY>
Body: { reason? }
```

Download tokens are HMAC-SHA256 signed with `DELIVERY_SIGNING_KEY` and use timing-safe comparison.

---

## Production deploy

The landing deploys on `storage-contabo` behind a host-network Traefik with HTTP-01 LetsEncrypt resolver. The app will deploy alongside in Phase 1+.

```bash
ssh storage-contabo
mkdir -p /opt/prin7r-deploys/industry-process-templates
cd /opt/prin7r-deploys/industry-process-templates
git clone https://github.com/prin7r-projects/industry-process-templates.git .
cp .env.example .env
# populate all required env vars in .env
docker compose build
docker compose up -d
```

---

## Payment integration — NOWPayments

This is the default and only crypto rail wired in Wave 2. Per Prin7r's payment strategy, NOWPayments is the verified production rail (USDT/USDC + card on-ramp). Plisio and Reown are documented as future rails in `.env.example`.

---

## DESIGN.md

The canonical design + style guide is at `DESIGN.md`. All landing-page changes update DESIGN.md alongside the code.

---

## License

The code in this repo is MIT — see `LICENSE`. The VerticalPlaybook *bundles* (SOPs, automations, n8n flow exports, prompt packs) sold to buyers are covered by a separate single-implementation commercial license documented at delivery time.
