# 03 — User Journeys

Three primary journeys covering discovery → first value → recurring use.

## Journey A — Maren the COO discovers Plumbline via a peer recommendation

**Context.** Tuesday afternoon, Maren's CEO forwards a tweet thread from a sister-company COO who just bought a Plumbline HVAC bundle. CEO's question: "Should we get one of these for our dispatch ops?"

**Steps.**
1. Maren opens the link from her phone during her commute. Reads the hero on mobile. The "operational system you wish came in the box" line sticks; she screenshots it for later.
2. That evening on her laptop she opens the page again. Scans the vertical grid. Their business is closer to "Real-estate brokerage" but adjacent. Clicks through to inspect template counts.
3. Reads the bundle anatomy: 28 SOPs, 14 automations, 9 n8n flows, 4 prompt packs. Recognizes 3 of the SOP plate excerpts as workflows her team has half-built.
4. Reads pricing. Vertical Pack is $1,490 — under the $2,500 expense threshold she can approve without CFO sign-off.
5. Clicks "Buy Vertical Pack — $1,490". Lands on NOWPayments hosted invoice page. Pays with Coinbase USDC.
6. (Wave 3) Receives email with bundle download link + setup walkthrough.

**Time to first value.** ~4 days from purchase to first SOP-driven team meeting.

**Friction risks.** (a) Vertical match — her business is real-estate-adjacent but not pure brokerage. Mitigation: each bundle's detail page (Wave 3) lists SOP names so she can verify match before purchase. (b) Crypto unfamiliarity — first-time stablecoin payer. Mitigation: NOWPayments hosted invoice supports card on-ramp.

## Journey B — Yusuf the Agency Principal arrives via Twitter/X

**Context.** Saturday morning. Yusuf scrolls X and sees a thread from an agency owner he respects: "Just bought the Plumbline marketing-agency bundle. 9 n8n flows wired in 90 minutes. Worth every $." Link.

**Steps.**
1. Clicks through. Opens hero on desktop. The hero blueprint figure is a real SOP excerpt from the marketing-agency bundle — the one for "Client onboarding day-1 to day-30." He recognizes it immediately as the one he's been meaning to write.
2. Scrolls to vertical grid. Clicks "Marketing agencies." Reads the 4 anatomy bullets.
3. Reads pricing. He's still on the fence — Vertical Pack ($1,490) is reasonable but he'd rather buy a single bundle first to evaluate.
4. Clicks "Buy Single Bundle — $249". Specifies "Marketing agencies — Client onboarding" via the bundle picker (deferred to Wave 3; v1 single-bundle CTA goes to a generic invoice and the bundle is sent based on the email he enters at NOWPayments).
5. Pays $249 in USDT-TRC20.
6. Forks the bundle. Adapts it to his agency's tools (Notion + Asana). Replaces 4 SOPs with his own. Repackages as his "Agency Onboarding System" retainer add-on at $4,000/customer.

**Time to first value.** Same evening — 6 hours from purchase to forked-and-adapted draft.

**Friction risks.** (a) License terms — he wants to know if he can resell adaptations. Mitigation: FAQ entry "Can I resell adaptations?" answers yes for paying customers but not as drop-in templates marketplace listings.

## Journey C — Recurring use, Vertical Pack subscriber

**Context.** Maren three months after her initial purchase. The HVAC bundle has paid for itself 4× over — her dispatch SLA dropped from 4 hours to 90 minutes. She gets an email: "Plumbline HVAC Bundle v2.1 published — 3 new SOPs, n8n flow updates for the new ServiceTitan API."

**Steps.**
1. Maren clicks the email. Lands on the bundle changelog page (Wave 3 — for v1, the FAQ entry says updates ship every quarter).
2. Reads what's new. Recognizes 1 of the 3 new SOPs is something her team had been improvising. Decides to adopt.
3. Downloads v2.1. Diffs against her customized v1.0. Merges the new SOPs into her customized bundle.
4. Schedules a 30-min team sync to walk through the new SOPs.

**Time to integrate update.** ~1 hour for diff + 30 min team sync.

**Friction risks.** (a) Update drift — her customizations may conflict with new bundle versions. Mitigation (Wave 3): published SOPs are markdown-based, diffable; n8n flows have versioned exports.

## Cross-journey anti-patterns

These are journeys we explicitly do **not** want.

- *"Browse-and-bounce buyer"* — someone who lands, opens the FAQ, leaves without engaging the vertical grid. Mitigation: vertical grid is positioned above pricing so the buyer self-qualifies before pricing decision.
- *"Wrong-vertical buyer"* — someone who buys an HVAC bundle for a software-services business. Mitigation: each vertical card explicitly lists the kind of business it fits (e.g. HVAC: "$2M-$25M residential HVAC services with 5-30 trucks").
- *"Drive-by template hoarder"* — buyer who never deploys. Mitigation: bundle includes a "Day-1 deploy checklist" SOP as the first SOP, so the path to first value is the first thing they see when they open the .zip.
