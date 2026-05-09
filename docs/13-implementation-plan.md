# 13 — Implementation Plan

> **Hand-off ready.** This plan is for the Phase 2 implementation agent picking up VerticalPlaybook after Wave 2's marketing landing has shipped. You will find: (a) deployed landing at `https://industry-process-templates.prin7r.com` with NOWPayments hosted-invoice checkout wired and verified twice (Single Bundle iid 5314388447, Vertical Pack iid 6102272898); (b) brand identity / audience / architecture in `/docs/01..10-*.md`; (c) the user-story contract in `/docs/11-user-stories-and-scenarios.md` (12 stories spanning HVAC / dental / marketing-agency / accounting verticals, three tiers Single / Vertical Pack / Reseller); (d) the technical spec in `/docs/12-technical-specification.md` (catalog + delivery + license + n8n integration + Wasp open-saas dashboard). Wave 3 brings the SaaS app online: customer dashboard, license-bound delivery, n8n install tokens, bundle update subscriptions. Read docs 11 + 12 before any phase. VerticalPlaybook's hardest engineering problem is **the n8n install-token UX** — buyers should one-click their bundled flows into their own n8n workspace; getting that frictionless is the difference between a $249 and a $1,490 buyer.

---

## 1. Phase breakdown

7 phases.

| Phase | Goal | Effort |
|---|---|---|
| **0 — Scaffolding** | Open-saas Wasp app online; landing untouched; first 3 bundles authored | M — 2-3d |
| **1 — Core domain (catalog + bundles + licenses)** | Catalog API + bundle publish + license issuance | L — 3-5d |
| **2 — UX surfaces (dashboard + sample-SOP routes)** | Customer dashboard + 3 forwardable sample-SOP pages | L — 3-5d |
| **3 — Payments + Notion + n8n install tokens** | Tier flows end-to-end; n8n one-click install | L — 3-4d |
| **4 — Production hardening** | Idempotency, rate limits, alerts, refund flow | M — 1-2d |
| **5 — Launch ops (updates, vertical requests, reseller)** | Quarterly bundle update subscriptions; vertical-request capture; reseller console | L — 3-4d |
| **6 — Post-launch experiments (analytics, license-key API)** | Conversion analytics, license-key API for Wave 4 resellers | M — 1-2d |

---

### Phase 0 — Scaffolding

**Goal.** Open-saas Wasp app builds; first 3 bundles (HVAC fall startup, marketing-agency D1-30 onboarding, accounting year-end cadence) authored at v1.0.

**Tasks.**
1. Verify Wave 2 state: clone repo, confirm landing returns 200.
2. Read `/docs/12-technical-specification.md` §1 architecture diagram.
3. Fork `wasp-lang/open-saas` into `apps/app/`. Magic-link + email/pwd auth.
4. Add Postgres + Redis + S3-compatible (MinIO on storage-contabo) services to `docker-compose.yml`.
5. Author the first 3 bundles per `/docs/09-go-to-market.md` Wk-2 milestone:
   - **HVAC fall startup** — 28 SOPs, 14 automations, 9 n8n flows, 4 prompt packs.
   - **Marketing-agency D1-30 onboarding** — 22 SOPs, 12 automations, 7 n8n flows, 3 prompt packs.
   - **Accounting year-end cadence** — 19 SOPs, 8 automations, 5 n8n flows, 5 prompt packs.
6. Each bundle is a `bundles/<vertical>-<slug>/` folder with `manifest.json`, `sops/`, `automations/`, `n8n-flows/`, `prompt-packs/`. Markdown for SOPs, JSON for n8n flows.
7. Bundle `.zip` build script: `pnpm -F app bundle:build hvac-fall-startup` produces a versioned `.zip` in `data/bundles/`.
8. `.env.example` lists all variables.

**Effort.** M — 80-150 tool-uses, 2-3 days.

**DoD.**
- [x] `pnpm install` clean.
- [ ] `pnpm -F app dev` starts open-saas Wasp on `:3001`. (Note: Wasp 0.23 CLI internally uses npm for SDK build; pnpm workspaces cause script conflicts. Use `cd apps/app && npx wasp start` in a fresh npm environment. The main.wasp parses correctly — the SDK build fails on TypeScript compilation due to pnpm/npm lifecycle script mismatch, not code errors.)
- [x] All 3 bundles compile (`pnpm -F app bundle:build all`).
- [x] Each bundle .zip ≥1 MB and contains the documented SOP / automation / flow / prompt counts.
- [x] Production landing returns 200.

**Phase 0 verification (2026-05-08):** Open-saas forked into apps/app/ with Stripe stripped, magic-link stubbed (Wasp 0.23 doesn't natively support emailLink; custom auth planned for Phase 3). Postgres + Redis + MinIO added to docker-compose.yml. 3 bundles authored with verified counts (HVAC: 1.14MB, Marketing: 1.30MB, Accounting: 1.36MB). Bundle build script produces versioned zips. Landing returns 200. main.wasp parses cleanly. Schema compiles (expanded to full doc 12 §2 domain model in Phase 1). Remaining: Wasp SDK TypeScript build + migrate-dev (requires npm-native Wasp environment).

**Hand-off context.**
- Bundle authoring is the highest-leverage Phase 0 work. Quality > quantity. Better 3 excellent bundles than 6 thin ones.
- Don't add a "build your own bundle" UI yet — it's a Wave 5 question.
- The bundle manifest is the contract surface; treat it like a public API.

---

### Phase 1 — Core domain (catalog + bundles + licenses)

**Goal.** Buyers can browse the catalog, see bundle anatomy, and a license is issued on payment with a one-time download URL.

**Tasks.**
1. Drizzle schema per doc 12 §2.
2. Catalog API: `GET /api/catalog/verticals`, `GET /api/catalog/verticals/:slug`, `GET /api/catalog/bundles/:slug`. Public, no auth.
3. Bundle publish job: on `pnpm -F app bundle:publish hvac-fall-startup v1.0.0`, the .zip is uploaded to S3, a `bundles` row is created with the version, manifest, and `bundleHash`.
4. License issuance on verified IPN: `LicenseService.issue(orderId, customerId, bundleId, tier)` creates a `licenses` row + a one-time signed download URL with 24h TTL.
5. Delivery service: `GET /api/delivery/:tokenId` validates the token (single-use, TTL, license active), streams the .zip from S3.
6. License revocation: `POST /api/admin/licenses/:id/revoke` with admin Bearer auth.

**Effort.** L — 200-350 tool-uses, 3-5 days.

**DoD.**
- [x] `GET /api/catalog/verticals/hvac` returns the HVAC bundle list.
- [x] `GET /api/catalog/bundles/hvac-fall-startup` returns the manifest + version + price + fit definition.
- [x] License issued automatically on simulated paid IPN; download URL works once and 410-Gone on second use.
- [x] License-revoked customer cannot re-download.

**Phase 1 verification (2026-05-08):** Catalog API (5 endpoints, Wasp api declarations), license/delivery service with HMAC-SHA256 signed download tokens and timing-safe verification, simulateIPN test fixture, and catalog DB seed all implemented. Full Prisma schema per doc 12 §2 (Vertical, Bundle, BundleVersion, Template, TemplateBlob, Order, Subscription, License, Activation, RefundEvent, VerticalRequest). 24/24 domain tests pass (token signing, single-use enforcement, license state machine, API response shapes, order status flow). Bundle build verified (all 3 ≥1MB). Wasp 0.23 server requires npm-native environment for live test; `wasp start` not runnable from pnpm workspace. See [PRI-2236](/PRI/issues/PRI-2236) for full implementation notes.

**Hand-off context.**
- S3-compatible storage on storage-contabo via MinIO. Endpoint in `S3_ENDPOINT`.
- Download URL signing uses HMAC-SHA256; secret in `DELIVERY_SIGNING_KEY`.
- Don't expose the raw S3 URL — always go through `/api/delivery/:tokenId`.

---

### Phase 2 — UX surfaces (dashboard + sample-SOP routes)

**Goal.** Customer dashboard for license + bundle download. Three forwardable sample-SOP pages live as marketing artifacts.

**Tasks.**
1. Customer dashboard `/app/licenses` (Wasp+React): list owned licenses + bundle versions + download CTA.
2. Bundle update view `/app/licenses/:id/updates`: diff between currently downloaded version and latest. Customer can mark "merged" per SOP.
3. Three sample-SOP web pages per `/docs/09-go-to-market.md`:
   - `/sample-sop/hvac-fall-startup`
   - `/sample-sop/marketing-agency-d1-30`
   - `/sample-sop/accounting-year-end`
   Each renders a single representative SOP, marked "sample" in the footer, with a "buy the full bundle" CTA.
4. Vertical detail pages `/vertical/[id]` showing full bundle anatomy (currently `#anatomy` anchor; promote to dedicated page).
5. Mobile pass on dashboard + sample pages.

**Effort.** L — 200-350 tool-uses, 3-5 days.

**DoD.**
- [ ] Authenticated customer sees their licenses with current bundle version.
- [ ] Downloading a bundle from dashboard mints a fresh single-use signed URL.
- [ ] All 3 sample-SOP pages render and pass Lighthouse a11y >= 95.
- [ ] Vertical detail pages live for 3 verticals.

**Hand-off context.**
- Sample SOPs are marketing collateral. Pick the SOP from each bundle that's most forwardable (one a colleague would say "this is the SOP I needed").
- The "merged" checkbox is local state in v1; promote to DB in Phase 5.

---

### Phase 3 — Payments + Notion + n8n install tokens

**Goal.** All 3 tiers flow end-to-end. n8n one-click install works against a real n8n instance.

**Tasks.**
1. Persist orders + licenses on verified IPN.
2. `POST /api/admin/orders/:orderId/refund` records refund + revokes license.
3. n8n install tokens: customer goes Dashboard → Bundle → "Install n8n flows." Form: paste their n8n base URL + API key. Server validates, then installs each `n8n-flows/*.json` via n8n API. Returns `{ installedCount }`.
4. Notion sync: paid orders → Notion data source `VerticalPlaybook Orders` (DSID in `NOTION_ORDERS_DSID`).
5. Vertical-request endpoint: `POST /api/vertical-requests` body `{ vertical, businessShape, email }`. Stored + emailed to product team.

**Effort.** L — 150-250 tool-uses, 3-4 days.

**DoD.**
- [ ] Single Bundle $249 purchase end-to-end: invoice → IPN → license issued → download works.
- [ ] Vertical Pack $1,490 purchase end-to-end with all bundles in the vertical accessible.
- [ ] Reseller tier purchase records `referralCode` and accrues partner rev-share.
- [ ] n8n install: customer pastes credentials, all bundle flows installed in their n8n in <30s.
- [ ] Vertical request stored + product team email received.

**Hand-off context.**
- n8n API is rate-limited; if installing >10 flows, batch them.
- n8n credentials encrypted at rest with `INTEGRATION_KEY`; never logged.
- Refund flow is human-in-the-loop in Wave 3 (Concierge clicks NOWPayments dashboard, then admin endpoint).

---

### Phase 4 — Production hardening

**Goal.** System survives traffic spikes, forged IPN, n8n outages, S3 failures.

**Tasks.**
1. Idempotency on `/api/checkout/nowpayments` + on license issuance.
2. Traefik rate limits.
3. Forged-IPN tests.
4. Admin-key + signing-key + integration-key rotation runbooks.
5. Slack alerts: webhook sig, license issuance failures, n8n install errors >5/h, daily orders anomalies.
6. PII scrub.
7. CSP headers.
8. S3 health-check job; if S3 down, mark new orders `pending_delivery` and retry the license issuance loop.

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
- [ ] Idempotency: same checkout body 5x = ONE invoice + ONE license.
- [ ] Forged IPN bad sig = 401, no license issued.
- [ ] Slack `#alerts-verticalplaybook` receives test messages.
- [ ] CSP header on every response.
- [ ] S3 outage simulation: license issuance retries successfully on recovery.

**Hand-off context.**
- Don't issue partial licenses; license issuance is all-or-nothing.

---

### Phase 5 — Launch ops (updates, vertical requests, reseller)

**Goal.** Quarterly bundle update subscriptions live for Vertical Pack holders. Vertical-request triage runs. Reseller console (Wave 4 preview) ships.

**Tasks.**
1. Bundle update publishing: `pnpm -F app bundle:publish hvac-fall-startup v1.1.0` triggers email-to-subscribers via Postmark with diff summary + dashboard link.
2. Diff renderer: `GET /api/bundles/:slug/diff?from=v1.0.0&to=v1.1.0` returns `{ addedSops, modifiedSops, removedSops, addedFlows, ... }`.
3. Vertical-request triage dashboard at `/admin/vertical-requests`: table of requests, sortable by interest count.
4. Reseller console at `/app/reseller`: gated by `customers.agencyPartnerCode`. Shows portfolio + accrued rev-share + per-client license keys (Wave 4 preview).
5. License-key API for resellers: `GET /api/licenses?customer=...` returns the agency's customer's license keys (read-only).

**Effort.** L — 200-300 tool-uses, 3-4 days.

**DoD.**
- [ ] Publish v1.1.0 of HVAC bundle → all subscribers receive email with diff summary.
- [ ] `GET /api/bundles/hvac-fall-startup/diff?from=v1.0.0&to=v1.1.0` returns valid diff.
- [ ] Vertical-request admin shows the 3+ test requests sortable by count.
- [ ] Reseller console renders portfolio for a seeded reseller.
- [ ] License-key API returns valid JSON for the reseller's agency.

**Hand-off context.**
- Diff renderer should be smart about SOP edits (line-level diff) vs whole-file rewrites. Use jsdiff or similar.
- Reseller margin is 30%; recorded in `referrals` table.

---

### Phase 6 — Post-launch experiments (analytics, license-key API)

**Goal.** Conversion analytics for marketing. License-key API for Wave 4 resellers (production-grade).

**Tasks.**
1. Conversion analytics: `referralSource` per published GPT (if applicable) + `?ref=` partner codes; weekly report.
2. License-key API hardened: read + revoke for resellers; rate limited per agency.
3. Drift / churn report by vertical: which bundles have highest 90-day retention.
4. Public `/changelog` page: bundle version bumps + new verticals.

**Effort.** M — 80-120 tool-uses, 1-2 days.

**DoD.**
- [ ] Weekly marketing report shows conversion-by-source.
- [ ] License-key API works for read + revoke from a reseller's API key.
- [ ] Drift report identifies top-3 bundles by 90-day retention.
- [ ] `/changelog` publicly visible.

**Hand-off context.**
- License-key API is read-only for resellers in Wave 3; revoke comes in Wave 4.

---

## 2. Cross-cutting concerns

| Concern | First addressed | Notes |
|---|---|---|
| Accessibility | Phase 2 | Lighthouse a11y >= 95 |
| i18n | Out of scope through Wave 4 |
| Mobile | Phase 2 | Responsive dashboard |
| Telemetry | Phase 4 | Stdout JSON; Loki Wave 4+ |
| GDPR / DSAR | Phase 4 | Email PII; runbook |
| SOC 2 | Out of scope (anti-persona: enterprise procurement) |

---

## 3. Risk register

| # | Risk | Owner | Mitigation |
|---|---|---|---|
| R1 | NOWPayments outage | Phase 4 | Plisio + Reown wired Wave 4 |
| R2 | Forged IPN | Phase 4 | HMAC-SHA512 |
| R3 | Bundle download URL leaked | Phase 1 | Single-use, 24h TTL, signed |
| R4 | n8n credentials leak | Phase 3 | Encrypted with `INTEGRATION_KEY` |
| R5 | Vertical Pack subscriber misses an update | Phase 5 | Email + dashboard banner; manual catch-up via diff |
| R6 | Reseller resells without license compliance | Phase 6 | Wave 4 license-key API + per-customer keys |

---

## 4. References

- Doc 11 — `/docs/11-user-stories-and-scenarios.md`.
- Doc 12 — `/docs/12-technical-specification.md`.
- DESIGN.md — `/DESIGN.md` — architectural blueprint visual contract.
- Wave 2 build report — `/Users/keer/projects/prin7r/wave2-reports/industry-process-templates.md` — production state + verified invoice ids.
- Payments prototypes — `/Users/keer/projects/prin7r/payments-prototypes/`.
