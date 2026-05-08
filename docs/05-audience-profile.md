# 05 — Audience Profile

## ICP — Ideal Customer Profile

**Plumbline's ICP is a $2M–$50M operating business in a defined vertical, with one operator (founder, COO, or agency principal) actively trying to build a coherent operational system, who has a budget line for ops tools but not for a $250k full-time COO hire, and who already pays for at least one SaaS automation tool (n8n, Make, Zapier).**

Concretely:

| Attribute | Value |
|---|---|
| Revenue | $2M – $50M |
| Headcount | 8 – 80 |
| Vertical | One of: HVAC services, dental practice, accounting firm, DTC ecommerce, real-estate brokerage, SaaS support, marketing agency |
| Operating maturity | Has SOPs but they're scattered (Notion + Google Docs + Slack threads); has automations but they're one-off |
| Tools already paid for | At least one of: n8n / Make / Zapier; Notion or ClickUp; Slack or Microsoft Teams |
| Decision authority | Single operator can authorize a $1,500 expense without committee |
| Time horizon | Wants ops in place within 60 days, not next quarter |
| Annual ops budget | $5,000 – $50,000 across tools, contractors, fractional consultants |

## Persona — Maren the COO (primary)

**Demographics.**
- 38, lives in Austin TX, master's in industrial engineering
- Second-in-command at a 22-person residential HVAC business doing $14M ARR
- Reports to founder; 4 direct reports

**Goals.**
- Get her dispatch SLA from 4hr response → 90min response by Q3
- Stop being the bottleneck for every operational decision
- Write down the operating system in her head before she gets hit by a bus

**Frustrations.**
- Her CEO keeps forwarding her articles about "ops AI" but doesn't know how to evaluate them
- Every Notion template she's bought is too generic to use
- The fractional COO consultant she trialed had no HVAC experience and wanted 8 weeks of paid discovery
- She's drowning in opportunity-cost-of-DIY: every evening she spends writing SOPs is an evening not spent on the business

**Where she lives.**
- COOAlliance.com community + monthly newsletter
- LinkedIn — follows ops leaders, comments on ops content
- "Operating Brand" podcast (Adam Coomer)
- HVAC trade groups: ACCA, BPI, NAOHSM
- Twitter/X — selectively, mostly for ops Twitter

**Buying triggers.**
- Peer recommendation from a sister-business COO
- A specific bundle SOP excerpt seen on Twitter that maps to a current pain
- End-of-quarter when she gets to spend her ops budget allocation

**Buying objections.**
- "How do I know this fits my business?" — answered by precise vertical fit definitions
- "What happens when my tooling changes?" — answered by quarterly updates
- "Crypto payment — is that legit?" — answered by NOWPayments having a card on-ramp

## Persona — Yusuf the Agency Principal (secondary)

**Demographics.**
- 32, lives in Toronto, computer science background
- Owns a 14-person digital agency doing $3.2M ARR
- Sells retained services (SEO, paid acquisition, email marketing)

**Goals.**
- Productize his proven internal playbooks into retainer add-ons
- Reduce delivery cost variance across clients (currently 2-4× spread)
- Ship a "Plumbline-grade" operating system as a marketing differentiator vs. competitors

**Frustrations.**
- His own team built ops in flight; nothing is written down
- He's been "going to package it up" for 18 months and hasn't
- Every agency-templates marketplace he's seen is either too sales-bro or too solopreneur

**Where he lives.**
- Agency-owner Slack groups (Demand Curve, Agency Mavericks, AgencyAnalytics community)
- Twitter/X agency-Twitter — follows Brett Williams, Liam Veitch, Sam Parr
- Newsletters: Demand Curve, The Hustle, Marketing Brew
- Podcasts: Agency Profit, Built Ground Up

**Buying triggers.**
- A peer he respects publicly bought a Plumbline bundle
- A bundle excerpt he sees that's better than what his own team is doing
- A Q4 reset moment ("this is the year I productize")

**Buying objections.**
- "Can I resell adaptations to my own clients?" — answered by license terms in FAQ
- "Is this just templates or is the n8n flow real?" — answered by anatomy section showing actual flow JSON exports

## Anti-personas (people we are not for)

These segments may show up; we should not build for them.

### Anti-persona 1 — The hobbyist solopreneur

A side-hustler with no team, no recurring revenue, no automation tools paid for. They want a $19 Notion template, not a $1,490 vertical pack. They will buy, not deploy, and write a 1-star review when the bundle isn't a Notion-pretty download.

**Why we exclude them.** The bundles assume baseline operational maturity (an existing CRM, an existing Slack, a paid n8n account). Selling to hobbyists means dumbing down the bundles, which destroys their value to ICP.

### Anti-persona 2 — The enterprise procurement buyer

A 1,000+ person business with a procurement team, a $50k+ purchase order requirement, vendor security review, SOC2 questionnaire, contract redlining.

**Why we exclude them.** Plumbline's mode is self-serve at $1,490 sticker. We do not have legal, compliance, or sales-engineering capacity to respond to enterprise procurement. Wave 4 may add an Enterprise tier; for v1 we politely decline.

### Anti-persona 3 — The "AI consultant" reseller

Someone who plans to buy a single bundle for $249 and resell it as a $25,000 "AI Operations Implementation" engagement, without paying for the per-seat license.

**Why we exclude them.** License terms (FAQ) explicitly require per-implementation purchase for resale, and the bundle README states the license. We also explicitly do not offer affiliate or reseller programs in v1.

### Anti-persona 4 — The "operating-system templates marketplace" arbitrageur

Someone who buys a bundle to repackage and list it on the Notion templates marketplace at $19. This violates license terms and we send takedown notices.

## Channel-fit matrix

| Persona | Best channel | Worst channel |
|---|---|---|
| Maren the COO | Peer-to-peer in COOAlliance + LinkedIn ops community | Twitter/X general feed (too noisy) |
| Yusuf the Agency Principal | Twitter/X agency niche + agency-owner Slack | LinkedIn (too corporate) |

See `06-sales-channels.md` for channel mix and budget allocation.
