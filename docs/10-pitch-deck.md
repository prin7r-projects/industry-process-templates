# 10 — Pitch Deck

10 slides. Markdown source for the slide deck. The HTML render lives at `docs/pitch-deck.html` — a single self-contained file that opens directly in a browser.

---

## Slide 1 — Title

**VerticalPlaybook**
*Operational architecture for the verticals that build the world.*

A marketplace of vertical-specific operational bundles — SOPs, automations, n8n flows, prompt packs — calibrated by industry, deployable in a day.

— Prin7r · Wave 2 · 2026

---

## Slide 2 — The problem

**Operators in vertical businesses can't get to a coherent operating system.**

- $250k full-time COO is too much.
- Fractional COO = 8 weeks of paid discovery + no artifact ownership.
- Notion templates pack = generic, not vertical, no automation glue.
- ChatGPT-generated SOPs = hallucinated specifics, no n8n flows, no version control.
- Build-it-yourself = 6 weeks of evenings that never finish.

The COO of a $14M HVAC business spends every Saturday morning thinking she should write down the operating system in her head. She doesn't. Three years pass.

---

## Slide 3 — The insight

**Operations is shared work — but the market sells it as private work.**

Senior operators in HVAC know the same 28 SOPs matter. The same dispatch ratios. The same 9 n8n flows. The market today forces every operator to discover them privately.

VerticalPlaybook's insight: **package the shared work as deployable artifacts, sell to the operators who would otherwise rebuild it from scratch.**

---

## Slide 4 — The product

**VerticalPlaybook ships vertical-specific operational bundles.**

Each bundle includes:
- 24-32 SOPs (markdown, diffable)
- 12-16 automations (Make / Zapier / webhook)
- 9 n8n flows (JSON exports)
- 3-5 prompt packs (versioned `.json`)

Each bundle is calibrated for one vertical. HVAC bundles are written by HVAC operators. Marketing-agency bundles by agency principals. Accounting-firm bundles by managing partners.

Drop-in deployable. First SOP running by Friday.

---

## Slide 5 — The verticals (launch 7)

| # | Vertical | Reference business size | Why this vertical |
|---|---|---|---|
| 1 | HVAC services | $2M-$25M residential, 5-30 trucks | Mature ops; ServiceTitan-friendly; ICP density |
| 2 | Dental practices | 1-3 location group practices | High SOP density; recurring update need |
| 3 | Accounting firms | 5-30 partner CPA firms | Regulatory cadence; year-end is a forcing function |
| 4 | DTC ecommerce | $5M-$50M Shopify-based | High automation surface; n8n flow density |
| 5 | Real-estate brokerage | $50M-$500M GCI residential brokerages | Compliance + transaction ops |
| 6 | SaaS support | 50-200 person SaaS support orgs | Tier-2 escalation playbooks; high reuse |
| 7 | Marketing agencies | 10-50 person digital agencies | Productization play; agency-principal demand |

---

## Slide 6 — The business model

**Self-serve at the floor; sales-led at the ceiling.**

| Tier | Price | Target buyer |
|---|---|---|
| Single Bundle | $249 | First-time evaluator |
| Vertical Pack | $1,490 | Operator with conviction on one vertical |
| Enterprise | $9,800 | Cross-vertical or holdco operator |

Crypto checkout via NOWPayments (USDT/USDC + card on-ramp). 30-day refund. 12 months of bundle updates included.

Wave 3 adds: license management, customer dashboard, bundle download tokens via open-saas (Wasp).

---

## Slide 7 — Distribution

**Peer-to-peer is the dominant channel; paid sponsorships seed it.**

35% — Vertical newsletter sponsorships (COOAlliance, Demand Curve, ACCA, Dental Economics)
25% — Peer-referral asset library (3 free public sample SOPs as forwardable bait)
15% — Agency-owner Slack/Discord retainer placements
10% — Twitter/X organic (founder thread per week with bundle excerpt)
5% — LinkedIn organic
5% — Cold outbound (Apollo-sourced COO list)
5% — Vertical conferences (Year 2+)

Target: >60% of buyers from non-paid channels by day-90.

---

## Slide 8 — Unit economics

| Metric | Target |
|---|---|
| ASP | $903 (blended) |
| CVR (qualified traffic → purchase) | 2-3% |
| CAC blended | <$400 |
| Quarterly update renewal | $190/yr |
| 12-month update renewal | >80% |
| Refund rate | <8% |
| 90-day cumulative net | $42,000 |

---

## Slide 9 — Why now

- The 7 launch verticals all have mature SaaS stacks (ServiceTitan, Dentrix, QuickBooks, Shopify, etc.) — automation glue points are stable.
- n8n adoption in mid-market ops crossed the chasm in 2025; bundle artifacts are now portable across self-hosted, cloud, and managed runtimes.
- LLM-augmented operations is real but requires *vetted prompt packs*, not free-form prompting — VerticalPlaybook ships the vetted packs.
- Mid-market COOs in 2026 are budget-allocated for "ops AI" but unable to evaluate it; VerticalPlaybook gives them a $1,490 entry point that produces visible output by Friday.

---

## Slide 10 — Ask

**Wave 2 ships:**
- Landing at `industry-process-templates.prin7r.com`
- 7-vertical grid + 3-tier pricing
- NOWPayments hosted-invoice checkout (live unpaid invoice verified)
- DESIGN.md, 10-doc strategy library, repo at `github.com/prin7r-projects/industry-process-templates`

**Wave 3 ask:**
- Open-saas (Wasp) fork in `apps/app/` for license + dashboard
- First 3 bundles authored to v1.0 (HVAC, marketing-agency, accounting-firm)
- 5 peer reviewers recruited and bundles in their hands
- $4,000 first-month sponsorship budget

**Wave 4 ask:**
- 4 additional verticals authored
- $20,000/quarter sustained sponsorship and community spend
- Operator-cohort funded for ongoing bundle authorship
