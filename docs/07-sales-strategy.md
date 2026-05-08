# 07 — Sales Strategy

## Sales motion

**Hybrid PLG with a low-friction self-serve floor.** Plumbline's sales motion is buyer-driven from $249 (single bundle) up through $1,490 (Vertical Pack). Above $9,800 (Enterprise) we step into a sales-led conversation, but Wave 2 ships only the self-serve tiers. Crypto checkout via NOWPayments handles the entire transaction; no human in the loop.

This works because:
- The buyer pre-qualifies themselves through the vertical-fit definitions on the landing.
- The bundle artifact is the unit of value — buying one is a small enough commitment to evaluate.
- The Vertical Pack price ($1,490) sits below the typical single-operator approval ceiling.
- For Enterprise, we do not gate the inquiry behind a form — we route to a calendar link that we (in Wave 3+) attend.

## Pricing tiers

### Single Bundle — $249

One bundle for one vertical. Buyer chooses 1 vertical at checkout. Includes:
- All SOPs in that vertical's library (typically 24-32 docs)
- All automations + n8n flow exports (typically 12-16)
- All prompt packs (typically 3-5)
- 12 months of bundle updates (quarterly cadence)
- Email-only support, 72-hour response

**Best for.** First-time buyers who want to evaluate Plumbline with a single bundle before committing to a vertical pack.

**Limits.** One vertical only. Single-implementation license — bundle artifacts cannot be redistributed, resold, or repackaged. Buyer's own teams may use the bundle freely within the buyer's own business.

### Vertical Pack — $1,490 (recommended)

Three bundles within a single vertical theme. (E.g. Real-estate brokerage = "Residential brokerage" + "Commercial brokerage" + "Property management" bundles.) Includes:
- Everything in Single Bundle ×3
- Cross-bundle integration playbook (how the 3 bundles compose)
- Quarterly group office-hour with Plumbline-grade operators in the vertical
- Priority support, 24-hour response

**Best for.** Operators with conviction on their vertical who want the full operational stack.

**Limits.** Same single-implementation license. Vertical Pack covers up to 100 internal users (more than ICP needs).

### Enterprise — $9,800

Custom bundle suite plus white-glove onboarding. Includes:
- 5-10 bundles selected jointly with the buyer
- 3-week white-glove deployment with a Plumbline-grade operator embedded
- 12 months of priority support, 8-hour response
- Bundle co-authoring rights (buyer can request 1 net-new bundle scoped together)
- License: organizational seat, multiple geographies of single legal entity

**Best for.** $50M+ businesses with cross-vertical operations or holding companies running multiple operating businesses.

**v1 fulfillment.** v1 lists Enterprise tier with NOWPayments invoice and a `Contact us` mailto fallback. No automated checkout for $9,800 — we want a human conversation before the wire.

## Pricing rationale

- **$249 single bundle.** Below the $300 "discretionary spend" ceiling for a self-serve operator; high enough that only a serious operator pays.
- **$1,490 Vertical Pack.** Below the typical $2,500 single-operator approval ceiling; just-above the discomfort threshold that selects for committed buyers.
- **$9,800 Enterprise.** Below the $10,000 procurement-process trigger but inside the budget of a 100-person operating business.

## Objection handling

| Objection | Response |
|---|---|
| "How is this different from a $99 Notion templates bundle?" | "Each bundle is one vertical, written by an operating expert in that vertical, with real n8n flows you can import — not just docs. The Notion templates you're thinking of are generic and read-only. We can't compete on the $99 mark; we don't try to." |
| "I'm not sure my vertical is here." | "Each vertical has a precise fit definition — e.g. HVAC = '$2M-$25M residential, 5-30 trucks.' If your business doesn't match, the bundle won't help. Email us at hello@plumbline — we have 4 more verticals coming in Q3." |
| "What's your refund policy?" | "30-day no-questions refund on the single bundle and Vertical Pack. We process the refund as a NOWPayments stablecoin reversal to the same wallet you paid from." |
| "Can I resell adapted versions to my clients?" | "If you're an agency principal: yes, you can use bundle-derived SOPs in your own client engagements. You cannot redistribute the bundle artifacts directly. We're working on a Reseller tier for Wave 4 that simplifies this." |
| "What about ongoing updates?" | "Quarterly bundle updates, included free for 12 months from purchase. After 12 months, $190/yr renewal for ongoing updates." |
| "Can I pay with a credit card?" | "Yes — NOWPayments supports card-on-ramp at checkout. The displayed price is in USD; the on-ramp converts." |
| "What if my n8n is self-hosted?" | "Bundle n8n flows are exported as JSON; they import into self-hosted, n8n.cloud, or any n8n compatible runtime." |
| "What if your bundle conflicts with my customizations?" | "Bundles ship as markdown SOPs and JSON workflows — both diffable. Updates ship with a 1-page diff so you can merge selectively." |

## Refund policy (verbatim, used on landing FAQ)

> *30-day no-questions refund on Single Bundles and Vertical Packs. Refund processed as a NOWPayments stablecoin reversal back to the wallet you paid from, within 5 business days. Enterprise tier refunds follow the contract terms agreed at signing.*

## Sales-led playbook (Enterprise, Wave 3+)

For Enterprise inquiries, the conversation runs:

1. **Discovery (45 min).** Understand the buyer's vertical, scale, current operating maturity, integration constraints (existing n8n / Make / Zapier / custom).
2. **Bundle selection (1 week).** Plumbline operations team scopes which 5-10 bundles fit. Sends a precise scope doc + price ($9,800 standard; quoted higher if scope expands).
3. **Procurement (varies).** Standard MSA + SoW. We have a 4-page template; we do not redline beyond reasonable customer redlines.
4. **Deployment kickoff.** 3 weeks, embedded operator. Weekly checkpoint.
5. **Handoff.** Bundle suite live in buyer's stack, support transition documented, support contact established.

## Forecast assumptions (90-day)

| Channel | Buyers/mo | ASP | Mo Rev |
|---|---|---|---|
| Newsletter sponsorship | 8 | $580 | $4,640 |
| Peer referral | 6 | $700 | $4,200 |
| Slack/Discord retainer | 3 | $1,490 | $4,470 |
| Twitter/X | 2 | $1,200 | $2,400 |
| LinkedIn organic | 1 | $1,490 | $1,490 |
| Cold outbound | 1 | $2,000 | $2,000 |
| Total inbound | ~21 | ~$903 | ~$19,200 |

90-day target revenue = ~$57,000 (~38 buyers across 90 days).

90-day cost = ~$15,000 (newsletters + retainers + tools).

90-day net = ~$42,000.

These numbers are aspirational targets, not commitments. The right unit-economics signal at end of 90 days is: $/buyer < $400, % buyers from non-paid channels > 60%.
