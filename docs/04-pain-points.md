# 04 — Pain Points (root-cause analysis)

The current alternatives for getting a working operational system into a vertical-specific business each fail in identifiable, root-cause ways.

## Alternative 1 — "Hire a fractional COO"

**Cost.** $4,000 – $12,000/month for a fractional engagement. $250,000+/yr for full-time.

**Failure modes.**
- *Calendar friction.* The COO is part-time across 3-5 clients. Decisions queue against the COO's availability, not the operator's needs.
- *Bias toward what the COO already knows.* A fractional COO who came from a Series-B SaaS doesn't know the SLA ladder of a residential HVAC business. The first 8 weeks are spent learning the vertical the buyer already lives in.
- *No artifact ownership.* When the engagement ends, the operator has notes and Slack threads but rarely a coherent SOP library. Re-engaging another fractional means redoing the discovery.

**Root cause.** Fractional COOs charge for time and expertise; they do not productize their output. The operator pays for the *learning*, not for *deployable artifacts*.

## Alternative 2 — "Buy a Notion templates pack"

**Cost.** $19 – $199 one-time.

**Failure modes.**
- *Generic, not vertical-specific.* The "Operations OS" template is the same template sold to a marketing agency, an HVAC business, and a dental practice. The Notion-templates marketplace is volume-driven; vertical-specific bundles don't match the unit economics for a single creator.
- *No automation glue.* A template is read-only. There are no n8n flows, no Zapier wiring, no API integrations. The operator copies the template structure into their Notion and is back to the start of the work.
- *Marketing-driven SOPs that don't survive contact with a real ops day.* The templates are written by Notion-template-influencers, not operating COOs. Once you try to run a real dispatch shift against the SOP, you discover the template assumes you have systems and rituals you don't have.

**Root cause.** Notion-templates marketplace pricing forces creators to write generic, decorative-not-operational templates that fit anyone and serve no one.

## Alternative 3 — "Use ChatGPT / Claude to write SOPs"

**Cost.** $20/mo subscription.

**Failure modes.**
- *Hallucinated specifics.* The LLM writes a "fall startup checklist" for HVAC that includes 3 plausible-sounding but wrong steps because it has no model of the actual ServiceTitan API.
- *No automations or n8n flows generated.* The LLM can describe what an automation should do but cannot produce a tested n8n workflow JSON.
- *No version control or update path.* Each conversation starts from zero. There is no "here's the v2 of your SOP based on what changed in your tooling last quarter."
- *Output dilution at scale.* Producing 28 SOPs in a single sitting takes hours of prompting + verification. The operator's cost is now their own time, which was the constraint that drove them to look for help in the first place.

**Root cause.** General LLM tools are not vertical experts. They are tools for *editing* vertical-specific knowledge, not *generating* it from zero with operational fidelity.

## Alternative 4 — "Hire a $50k contractor to build it"

**Cost.** $25,000 – $80,000, 6 – 12 weeks.

**Failure modes.**
- *Contractor lacks vertical authority.* The contractor delivers "best-practice SOPs" sourced from generic management literature, not from operating dental-practice or DTC-ecommerce businesses.
- *No update commitment.* When the operator's tooling changes 8 months later, there is no agreement to update the bundle.
- *Expensive failure mode.* If the contractor produces a low-quality bundle, the operator absorbed full price and 8 weeks of opportunity cost before discovering the gap.

**Root cause.** A custom build is the most expensive way to acquire vertical-specific knowledge that already exists in the heads of senior operators in the vertical.

## Alternative 5 — "Build it yourself in your evenings"

**Cost.** 6 weeks of evenings — opportunity cost ~$15,000 of equivalent operator time.

**Failure modes.**
- *Never finishes.* The build queue collides with the actual operating queue. The operator finishes the first 4 SOPs in week 1 and the remaining 24 spend the next 6 months in "I'll get to it" purgatory.
- *Idiosyncratic, hard to onboard.* The internally-built SOPs reference one operator's mental model. When that operator leaves, the SOPs become unreadable to the rest of the team.
- *Doesn't compound.* Each operator builds their own version privately. There is no shared improvement loop — no v2 from the field, no edge-cases reported back, no library of n8n flows that have been battle-tested across 50 similar businesses.

**Root cause.** Operations is shared work. Building privately is rebuilding from zero — the curve never bends.

## What Plumbline does differently

| Failure mode | Plumbline mechanism |
|---|---|
| Generic, not vertical-specific | One bundle per vertical, written by an operating expert in that vertical with a real reference business pinned. |
| No automation glue | Bundle includes 9-14 n8n flows + automation scripts, not just docs. |
| LLM hallucinations | Every step in every SOP is reviewed against a real reference business in that vertical before publish. |
| No update path | Quarterly bundle updates pushed to existing buyers; semantic versioning; diffable markdown. |
| 6-week build | Drop-in deploy in <1 day; first SOP running by Friday. |
| No shared learning | Operator buyers can submit edge-case PRs back to the bundle (Wave 3); the curve bends across all buyers in a vertical. |
| Wrong-vertical fit | Each bundle has a precise "fits if" definition (e.g. "$2M-$25M residential HVAC, 5-30 trucks") so buyers self-qualify before paying. |

## What Plumbline does *not* solve

- *Strategy.* Bundles are operational, not strategic. They tell you how to run a dispatch shift, not whether to enter a new market.
- *Hiring.* Bundles include role-by-role responsibility maps but do not source candidates.
- *Bespoke compliance.* Highly regulated verticals (medical-grade dental, financial advisory) get a baseline that needs a compliance officer review before deploy. The bundle says so explicitly in its own README.
