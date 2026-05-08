# 11 — User Stories and Scenarios

This document is the canonical input contract for the Phase 2 SaaS implementation agent. It enumerates personas, primary user stories, end-to-end scenarios (happy paths, edge cases, anti-scenarios), and ties each flow to the frontend touch-points and backend services that doc 12 specifies. Every API endpoint in doc 12 must trace back to at least one story here; no orphan endpoints, no orphan stories.

---

## 1. Personas summary

VerticalPlaybook is built for senior operators in defined verticals, not for hobbyists or for enterprise procurement. See `05-audience-profile.md` for the full deep-dive; the short form lives here.

### Persona A — Maren the COO (primary, ~70% of buyers)

38, second-in-command at a $14M residential HVAC business. Has a Notion full of half-finished SOPs, a Slack channel of one-off automations, and a CEO who keeps forwarding her "ops AI" articles. Single-operator approval up to ~$2,500 without committee. Reads ACCA briefings, COOAlliance digest, the Operating Brand podcast. Buys when a sister-business COO recommends a bundle and the vertical-fit definition matches her business shape ("$2M-$25M residential HVAC, 5-30 trucks"). Pays in stablecoin or card-on-ramp via NOWPayments without flinching once she's seen the bundle anatomy. *Core need: a coherent, deployable operating system for her specific vertical, in days not weeks.*

### Persona B — Yusuf the Agency Principal (secondary, ~20% of buyers)

32, owns a 14-person digital agency at $3.2M ARR. Wants to productize his playbooks into retainer add-ons and reduce client-delivery cost variance. Buys a single bundle ($249) first to evaluate, then a Vertical Pack if the first bundle adapts well. Lives in agency-owner Slack groups, agency-Twitter, Demand Curve. Asks license-resale questions before purchase. *Core need: high-fidelity reference bundles he can fork into productized retainers without 6 weeks of revenue-free packaging time.*

### Persona C — Priya the Ops Lead at SMB (tertiary, ~10% of buyers)

29, ops lead at a 12-person dental practice management group. Reports to a partner-owner who holds purchasing authority. Cannot self-approve $1,490; routes purchase requests through the partner. Lives in dental-trade Slack and Dental Economics newsletter. Comes in via a peer recommendation, then does a 1-2 week internal sell before the partner buys on her behalf. *Core need: a defendable, partner-readable case for buying a vertical pack rather than building internally.*

### Anti-personas (out of scope — see doc 05 for full breakdown)

Hobbyist solopreneur (no team, no automations paid for); enterprise procurement buyer (1,000+ headcount, SOC2 review); AI-consultant reseller (buys to repackage as a $25k engagement); template-marketplace arbitrageur. Stories and APIs in this doc deliberately exclude flows for these segments.

---

## 2. Primary user stories

10 stories that cover the core product loop end-to-end (discovery → purchase → activation → recurring use → escalation). Each story maps to at least one scenario in §3 and at least one API endpoint in doc 12 §3.

1. **As an HVAC ops lead, I want to deploy a fall-startup SOP bundle to my team's shared drive in <30 min, so that I don't lose ramp-up days.**
2. **As a COO, I want to verify my vertical fit before paying $1,490, so that I don't buy a bundle that doesn't match my business shape (e.g. residential HVAC vs. commercial HVAC).**
3. **As a dental practice owner, I want to buy a Vertical Pack for my practice and three sister practices, so that I can standardize ops across my mini-group with one purchase.**
4. **As an agency principal, I want to fork a marketing-agency bundle and adapt it to my own tooling (Notion + Asana), so that I can ship a productized retainer add-on at $4,000/customer without 6 weeks of revenue-free packaging time.**
5. **As a buyer, I want to install a bundled n8n flow with one click that wires through my own n8n credentials, so that I don't spend a half-day debugging connector setup.**
6. **As a Vertical Pack subscriber, I want to receive quarterly bundle updates with a diffable change log, so that I can merge updates into my customized version without reading 28 SOPs end-to-end.**
7. **As an ops lead at an SMB, I want to share the bundle changelog and SOP excerpts with my partner-owner before purchase, so that I can defend the buy internally.**
8. **As an agency reseller, I want to manage per-client license keys for bundle-derived SOPs (Wave 4), so that I can comply with the bundle license while reselling my adaptations.**
9. **As a buyer whose vertical we don't yet cover, I want to request a custom-template path, so that I can register interest and get notified when the vertical ships.**
10. **As a buyer paying in crypto for the first time, I want a card-on-ramp option at checkout, so that I'm not blocked by the unfamiliarity of stablecoin payment.**
11. **As an unhappy buyer, I want to request a refund within 30 days, so that I can recover my purchase if the bundle doesn't fit. (Required by refund-policy commitment in doc 07.)**
12. **As a returning Vertical Pack holder, I want to see which SOPs in my bundle have been updated since I last logged in, so that I can prioritize what to re-review with my team.**

---

## 3. Main scenarios (happy paths)

Each scenario is one narrative walkthrough from trigger to value moment. Frontend and backend touch-points are listed so doc 12 can wire them.

### Scenario 1 — Single-bundle purchase + first SOP deployed (HVAC vertical)

**Trigger.** Maren clicks a tweet thread from a sister-business COO recommending VerticalPlaybook's HVAC bundle. She lands on `https://industry-process-templates.prin7r.com/?ref=twitter-cooalliance-2026q2`.

**Steps.**
1. Maren reads the hero ("The operational system you wish came in the box.") and scrolls to the Vertical Grid. *Frontend: `BlueprintHero`, `VerticalGrid` components on `apps/landing/app/page.tsx`.*
2. Clicks the "HVAC" card. The card expands to show the bundle anatomy preview ("28 SOPs / 14 automations / 9 n8n flows / 4 prompt packs") and the vertical-fit definition ("$2M-$25M residential HVAC, 5-30 trucks"). *Frontend: `VerticalGrid` → `BundleAnatomy` modal/drawer (Wave 3 detail page).* *Backend: `GET /api/catalog/verticals/:slug` returns the vertical's bundle list and fit definition.*
3. She self-qualifies: 14 trucks, $14M ARR, residential. Match. Scrolls to Pricing.
4. Decides on Single Bundle ($249) to evaluate before committing. Clicks "Buy single bundle — $249." *Frontend: `PricingTier` component CTA.*
5. Browser POSTs to `/api/checkout/nowpayments` with `{ tier: 'single-bundle', bundle: 'hvac-fall-startup' }`. *Backend: `POST /api/checkout/:provider` (doc 12 §3.2) constructs a NOWPayments hosted invoice, returns `{ checkoutUrl }`.*
6. Browser redirects to NOWPayments hosted checkout. Maren pays $249 in USDT-TRC20.
7. NOWPayments POSTs the IPN to `/api/webhooks/nowpayments`. Server verifies HMAC-SHA512, persists the order, generates a license key, mints a one-time bundle download token. *Backend: `POST /api/webhooks/:provider` → `LicenseService.issue(orderId)` → `DeliveryService.mintToken(licenseId)`.*
8. (Wave 3) Maren receives an email with the bundle .zip download link, the license key, the day-1 deploy checklist URL, and the n8n install-token CTA.
9. Maren downloads the .zip, drops the SOPs into her team's shared Notion, opens the "Day-1 deploy checklist" SOP, and runs it during Friday's ops sync.

**Success criteria.**
- Order persisted with `status='paid'` and `licenseKey` issued within 5s of IPN receipt.
- Download token TTL ≥ 24h, single-use semantics enforced.
- Day-1 SOP visible to Maren in <30 min from purchase confirmation.

**Frontend touch-points.** `BlueprintHero`, `VerticalGrid`, `BundleAnatomy` (preview), `PricingTier`, success-redirect page (Wave 3), customer dashboard (Wave 3).
**Backend touch-points.** `GET /api/catalog/verticals/:slug`, `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`, `LicenseService`, `DeliveryService`, transactional email (Postmark or Resend, Wave 3).

### Scenario 2 — Vertical-pack subscription (dental practice owner)

**Trigger.** Priya (ops lead) shares a VerticalPlaybook link with the partner-owner of a 4-practice dental group after a peer recommends the dental Vertical Pack at a Dental Economics dinner.

**Steps.**
1. Partner-owner opens the link on desktop, scrolls to the Dental card in the Vertical Grid. Reads the fit definition ("private-practice dental, 1-6 chairs, $1M-$10M ARR, US/CA jurisdiction").
2. Clicks into the dental detail page (Wave 3) and reviews the 3-bundle composition (Single-chair starter / Multi-chair scaling / Multi-practice operations). *Backend: `GET /api/catalog/verticals/dental/bundles`.*
3. Reads the cross-bundle integration playbook preview. Reads the included quarterly office-hour benefit.
4. Partner-owner clicks "Buy Vertical Pack — $1,490". Browser POSTs to `/api/checkout/nowpayments` with `{ tier: 'vertical-pack', vertical: 'dental' }`. *Backend: invoice created, `iid` returned.*
5. Pays via NOWPayments with USDC on Coinbase wallet.
6. IPN received and verified; `Subscription` row created with `tier='vertical-pack'`, `vertical='dental'`, `expires_at = now + 12 months`. License covers up to 100 internal users.
7. (Wave 3) Welcome email with all 3 bundle download links + license key + invitation to next quarterly office-hour.
8. Priya forwards the welcome email internally; the practice manager imports the multi-practice SOP set into the practice-management software within 2 days.

**Success criteria.**
- `Subscription` and `License` rows linked; license enforces ≤100 active users.
- All 3 bundle download tokens minted and emailed.
- Office-hour invitation auto-added to subscriber's next quarterly cohort list (Wave 3 SaaS feature).

**Frontend touch-points.** Vertical detail page (Wave 3), `PricingTier`, success-redirect, customer dashboard.
**Backend touch-points.** `GET /api/catalog/verticals/:slug`, `GET /api/catalog/verticals/:slug/bundles`, `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`, `SubscriptionService`, `LicenseService` (multi-bundle issuance), email pipeline.

### Scenario 3 — Browse-and-compare across two adjacent verticals (DTC vs. agency)

**Trigger.** A founder runs a hybrid business — direct-to-consumer ecommerce brand operated through a small in-house agency team. They are unsure whether to buy the DTC bundle or the marketing-agency bundle.

**Steps.**
1. Founder lands on the home page from a Demand Curve newsletter sponsorship.
2. Clicks "Compare verticals" in the top nav (Wave 3). Compare view opens at `/compare?left=dtc-ecommerce&right=marketing-agency`. *Frontend: `VerticalCompare` component, two-column layout. Backend: `GET /api/catalog/compare?verticals=dtc-ecommerce,marketing-agency` returns parallel bundle anatomies, fit definitions, sample SOP names, and overlap percentage.*
3. Reads the side-by-side: DTC has 3 SOPs that overlap with agency content (client-onboarding, retention, attribution). Agency has 4 SOPs the DTC bundle lacks.
4. Decides their primary work is agency-side and buys the marketing-agency Single Bundle as a starter ($249), with intent to upgrade to a Vertical Pack if it fits.
5. Same checkout flow as Scenario 1.

**Success criteria.**
- Compare view loads in <500ms p95 (catalog data is read-mostly).
- Overlap calculation accurate (computed from the SOP catalog metadata).
- Clear CTA to either Single Bundle or Vertical Pack from each side of the compare view.

**Frontend touch-points.** Top-nav "Compare" link, `VerticalCompare`, two `BundleAnatomy` instances, dual `PricingTier` CTAs.
**Backend touch-points.** `GET /api/catalog/compare`, catalog cache layer.

### Scenario 4 — n8n automation activation flow (template → connector → live trigger)

**Trigger.** Maren has downloaded the HVAC bundle. She opens the "Dispatch SLA monitoring" n8n flow and wants to activate it against her ServiceTitan account.

**Steps.**
1. Maren clicks the "Install in n8n" button next to the flow inside her VerticalPlaybook customer dashboard (Wave 3). *Frontend: `BundleArtifactList` row → `InstallN8NButton`.*
2. Browser POSTs to `/api/n8n/install-token` with `{ licenseId, flowId }`. *Backend: validates license, mints a short-lived (5 min) n8n install token, returns `{ installUrl, expiresAt }`.*
3. The `installUrl` is a redirect into Maren's n8n instance with a one-time-use payload that imports the workflow JSON. Maren clicks through; n8n shows the imported workflow in draft.
4. n8n prompts Maren to wire credentials (ServiceTitan API key, Slack webhook). The bundle workflow JSON has placeholders rather than credentials.
5. Maren saves credentials. She clicks "Test trigger" in n8n. The workflow fires once against a sample dispatch ticket.
6. She activates the workflow live. VerticalPlaybook's install-token endpoint receives a follow-up "activation confirmed" beacon (Wave 3 — bundle workflow includes a small first-run callback).
7. The VerticalPlaybook dashboard updates: this flow's status transitions from `installed` → `active`. *Backend: `Activation` row updated.*

**Success criteria.**
- Install token TTL ≤ 5 min and single-use.
- Workflow JSON valid for n8n versions ≥ 1.42 (or whichever LTS VerticalPlaybook targets at ship time).
- Activation status visible in dashboard within 30s of trigger fire.
- p95 latency for install-token issuance ≤ 10s end-to-end (includes n8n redirect and JSON import).

**Frontend touch-points.** Customer dashboard `BundleArtifactList`, `InstallN8NButton`, activation status pill.
**Backend touch-points.** `POST /api/n8n/install-token`, `Activation` table, optional first-run callback handler `POST /api/n8n/activation-callback`, observability metrics (install duration histogram, activation conversion gauge).

### Scenario 5 — Custom-template request escalation (vertical we don't have)

**Trigger.** A buyer in a vertical VerticalPlaybook doesn't currently sell — say, a senior-living facility operator — visits the site, scrolls the Vertical Grid, doesn't find a fit.

**Steps.**
1. Visitor scrolls past the 7 verticals and finds a footer CTA: "Vertical not listed? Request it." *Frontend: `VerticalRequestForm` component on home page bottom and on a `/request-vertical` route.*
2. Clicks through. Form asks: business vertical (free text), revenue band, current ops tools, what they'd pay for a bundle. *Backend: `POST /api/vertical-requests` writes to a `VerticalRequest` table.*
3. Submits. Sees a confirmation: "We log every request and prioritize the next vertical based on volume + fit. You'll hear from us if we ship your vertical within 6 months."
4. (Wave 3) When VerticalPlaybook ships a new vertical, all matching requests get a one-time email with the vertical's launch link.

**Success criteria.**
- No automated promise of custom SOP authoring (we explicitly do not offer that — see anti-scenarios §5).
- Form is rate-limited to prevent spam (server-side captcha + 1 req/min/IP).
- Volume of requests is observable in an internal admin dashboard so VerticalPlaybook can prioritize the next vertical.

**Frontend touch-points.** `VerticalRequestForm`, `/request-vertical` page, footer CTA.
**Backend touch-points.** `POST /api/vertical-requests`, `VerticalRequest` table, captcha integration (hCaptcha), admin-only `GET /api/admin/vertical-requests` (Wave 3+).

### Scenario 6 — Quarterly bundle update + diff review (existing Vertical Pack subscriber)

**Trigger.** Maren receives an email: "VerticalPlaybook HVAC Bundle v2.1 published — 3 new SOPs, n8n flow updates for the new ServiceTitan API." (Email triggered by the Wave 3 update-publish job.)

**Steps.**
1. Maren clicks the email link. Lands on her customer dashboard's "Updates" tab. *Frontend: `UpdatesFeed` component listing all bundle updates since `subscription.last_seen_update_at`.*
2. Clicks the v2.1 entry. Opens the changelog page with the diffable markdown changes per SOP and the JSON-flow diff per n8n workflow. *Backend: `GET /api/bundles/:slug/versions/:version/diff?against=:previousVersion`.*
3. Reviews the 3 new SOPs. Decides 2 of them apply; 1 doesn't fit her configuration.
4. Clicks "Download v2.1 for selective merge". A new download token is minted. *Backend: `POST /api/delivery/refresh-token` — checks license + subscription validity, mints a fresh single-use download token.*
5. Maren downloads, diffs against her customizations locally, merges 2 of 3 new SOPs, re-imports the updated n8n flows.

**Success criteria.**
- `last_seen_update_at` is updated when she opens the v2.1 entry, so the bell-icon counter clears.
- Update download tokens reuse the existing license; no payment step.
- p95 latency for changelog load ≤ 500ms.

**Frontend touch-points.** Customer dashboard, `UpdatesFeed`, changelog viewer with diff rendering.
**Backend touch-points.** `GET /api/bundles/:slug/versions`, `GET /api/bundles/:slug/versions/:version/diff`, `POST /api/delivery/refresh-token`, update-publish job.

---

## 4. Edge case scenarios

Each edge case names the failure mode, the system response, and any escalation path.

### Edge case 1 — Vertical mis-categorization at signup

**Scenario.** Buyer self-selects HVAC at the catalog page but their actual business is commercial HVAC + facilities management (mixed vertical) — not the residential 5-30-truck shape VerticalPlaybook calibrated for.

**System response.**
- Pre-purchase: vertical detail page lists a mandatory fit-check ("This bundle assumes: residential, 5-30 trucks, $2M-$25M ARR. If your business doesn't match, see [other vertical] or request a new vertical.").
- Post-purchase: 30-day no-questions refund per doc 07. Refund processed via NOWPayments stablecoin reversal to the same wallet.
- Internal: refund triggers an entry in `RefundEvents` with `reason='wrong-vertical'` so VerticalPlaybook can analyze fit-definition tightness over time.

### Edge case 2 — n8n connector breakage (third-party API change)

**Scenario.** ServiceTitan deprecates their `v1.2` API. The bundle's "Dispatch SLA monitoring" n8n flow fails on next run.

**System response.**
- VerticalPlaybook subscribes to a small set of high-criticality vendor changelogs (ServiceTitan, Notion, Slack, etc.) and runs a daily synthetic-test job per critical flow.
- When a synthetic test fails, an internal "broken-connector" alert fires (Slack channel + on-call rota).
- VerticalPlaybook ships an out-of-cycle bundle patch (vN.M.1) within 5 business days. All subscribers receive an email + dashboard banner.
- Customer dashboard shows a "Connector breakage detected — patch incoming" banner on the affected bundle until the patch ships.

### Edge case 3 — Template version drift (customer customized v1.0 deeply, v2.0 ships breaking changes)

**Scenario.** Maren customized the HVAC bundle's "Dispatch SLA" SOP heavily. VerticalPlaybook ships v2.0 with a structural rewrite of that SOP.

**System response.**
- v2.0 changelog flags structural changes per SOP with a `breaking: true` field. Dashboard groups breaking vs. non-breaking changes separately.
- A "Migration notes" section in the changelog explains how to port v1 customizations to v2.
- Customer can choose to skip breaking SOPs (download v2.0, manually skip the rewritten file). License still entitles them to all updates.
- Wave 4: per-SOP semver so customers can pin SOPs at version boundaries.

### Edge case 4 — Refund window edge (purchase made hour-29 of day-30)

**Scenario.** Customer requests refund 30 days + 4 hours after purchase.

**System response.**
- Refund window is 30 calendar days from `order.paid_at`. Hard boundary, not "30 working days" or rolling-window.
- If outside window: customer-support response explains policy, offers a 50% goodwill credit toward a future Vertical Pack upgrade (Wave 3 mechanism).
- If inside window: automated NOWPayments stablecoin reversal queued, license invalidated, download tokens revoked.

### Edge case 5 — License-violation reseller behavior

**Scenario.** A buyer of a single $249 bundle relists the bundle .zip on the Notion templates marketplace at $19.

**System response.**
- License terms (in bundle README + landing FAQ) explicitly forbid redistribution.
- VerticalPlaybook serves takedown notices to the marketplace and to the buyer.
- If repeated: license keys are revoked, future purchases blocked by IP/wallet/email matchup.
- Wave 4: each bundle .zip contains a license-encoded watermark in SOP metadata so origin is traceable.

### Edge case 6 — Concurrent download-token race (buyer clicks link twice)

**Scenario.** Buyer clicks the download email link twice in quick succession. The token is single-use.

**System response.**
- First request consumes token, returns the .zip stream.
- Second request hits revoked-token state, returns `409 Conflict` with body `{ error: 'token-already-used', refreshUrl: '/api/delivery/refresh-token' }`.
- The dashboard's "Download" button always re-mints a fresh token on click; the only stale-token path is the original email link.

### Edge case 7 — Crypto payment received but IPN never delivered

**Scenario.** NOWPayments accepts the payment and confirms on-chain, but the IPN fails to reach our webhook (network error, DNS, etc.) within 24 hours.

**System response.**
- VerticalPlaybook runs a reconciliation job daily that polls `GET /v1/payment/{payment_id}` for any in-flight invoice older than 30 min.
- If reconciliation finds a paid invoice without a corresponding `Order.status='paid'`, it manually triggers the post-payment flow (license issuance, email).
- Customer-facing: if 24h elapse without delivery email, customer can self-trigger via a "Resend my purchase" form keyed by email + transaction id.

### Edge case 8 — Catalog cache stale after bundle update

**Scenario.** Bundle vertical page shows old SOP count (28) but the bundle has been updated to 31 SOPs.

**System response.**
- Catalog cache TTL = 5 min; cache also invalidated on bundle-publish event from the content-source pipeline (Notion → catalog sync job).
- If a user lands on a stale page, their dashboard view of the bundle (post-purchase) is fetched fresh and shows the correct count.

---

## 5. Anti-scenarios (explicitly out of scope)

These flows are deliberately not built. Future implementation agents must not add them without product approval.

1. **We do not write custom SOPs ad-hoc on request.** VerticalPlaybook is a marketplace of pre-packaged vertical bundles; we do not run a bespoke SOP authoring service. Buyers can request a new vertical (Scenario 5), and we ship if volume justifies; we do not write a one-off SOP for a single buyer.
2. **We do not manage compliance audits.** Bundles ship with a baseline that highly-regulated verticals (medical-grade dental, financial advisory) must take to a compliance officer for review before deploy. We are not a compliance certifier and do not maintain a compliance-officer review pipeline.
3. **We do not host a multi-tenant SaaS for the operator.** VerticalPlaybook does not run the buyer's n8n, does not host their SOP library, does not manage their team's access. We deliver the bundle artifact; the buyer deploys it into their own stack. Wave 3 SaaS adds a customer dashboard for license/download management only — never for the buyer's operational data.
4. **We do not offer an affiliate program in v1.** No referral-link generation, no commission tracking. Considered for Wave 4+ behind license-tier protections.
5. **We do not redline enterprise procurement contracts.** Enterprise tier exists ($9,800) but the v1 fulfillment is "schedule a call, sign our 4-page MSA, no redlines beyond reasonable customer redlines." We will not entertain SOC2 questionnaires, vendor security reviews, or DPA negotiations in Wave 2 or Wave 3.
6. **We do not auto-translate bundles into other languages.** v1 ships English-only. Bundles assume US/CA jurisdiction context. Localization is not on the Wave 3 roadmap.

---

## 6. Story → API trace matrix

This matrix is the input contract for doc 12 §3 (API contracts). Every story below must map to an endpoint or service in doc 12. If a row has no corresponding endpoint, doc 12 must be amended.

| Story | Scenarios | Backend touch-points (doc 12 §3) |
|---|---|---|
| 1 (deploy fall-startup SOP <30 min) | S1 | `GET /api/catalog/verticals/:slug`, `POST /api/checkout/nowpayments`, `POST /api/webhooks/nowpayments`, `POST /api/delivery/refresh-token` |
| 2 (verify vertical fit pre-purchase) | S1, S3 | `GET /api/catalog/verticals/:slug`, `GET /api/catalog/compare` |
| 3 (Vertical Pack for mini-group) | S2 | `POST /api/checkout/nowpayments` (tier=vertical-pack), `SubscriptionService` |
| 4 (fork agency bundle into retainer) | S1, S3 | `POST /api/checkout/nowpayments`, license-resale terms in license payload |
| 5 (one-click n8n install) | S4 | `POST /api/n8n/install-token`, `POST /api/n8n/activation-callback` |
| 6 (quarterly diffable updates) | S6 | `GET /api/bundles/:slug/versions`, `GET /api/bundles/:slug/versions/:version/diff`, `POST /api/delivery/refresh-token` |
| 7 (share excerpts with partner pre-purchase) | S2 | public sample-SOP routes (`/sample-sop/:vertical/:slug`), `GET /api/catalog/sample-sop` |
| 8 (per-client license keys for resellers) | (Wave 4) | `Reseller` + `ChildLicense` tables — flagged as Wave 4 in doc 12 §10 |
| 9 (request a new vertical) | S5 | `POST /api/vertical-requests`, admin `GET /api/admin/vertical-requests` |
| 10 (card-on-ramp at checkout) | S1, S2, S3 | NOWPayments hosted invoice supports it natively — no VerticalPlaybook endpoint needed |
| 11 (refund within 30 days) | EC4 | `POST /api/refunds`, `RefundService`, NOWPayments reversal API |
| 12 (see what's updated since last login) | S6 | `GET /api/dashboard/updates` (uses `subscription.last_seen_update_at`) |

---

*End of doc 11.* Doc 12 (technical specification) defines how each backend touch-point listed above is implemented. Doc 13 (implementation plan) sequences the work into phases.
