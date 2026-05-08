# VerticalPlaybook — DESIGN.md

> Operational architecture, drawn to scale.

This is the canonical design and style guide for **VerticalPlaybook** — Prin7r's marketplace of vertical-specific operational templates. Every visual decision in `apps/landing/` references this file. Updates ship together.

---

## 1. Product and audience

**Product.** VerticalPlaybook is a marketplace of vertical-specific operational bundles. Each bundle is a deployable kit of standard operating procedures (SOPs), automations, n8n workflows, prompt packs, and embedded job aids — calibrated for one industry. A buyer picks their vertical (HVAC, dental practice, accounting firm, ecommerce-DTC, real-estate brokerage, SaaS support, marketing agency), pays in stablecoin or card-on-ramp via NOWPayments, and gets a ready-to-deploy bundle that drops into their stack within a day rather than the six-week internal-build alternative.

**Audience.**
- **Primary persona — Maren the COO.** 38, second-in-command at a $20M services or trade business. Has a Notion full of half-finished SOPs and a Slack channel of one-off automations the founder wired together. Wants to graduate to a real operating system without hiring a $250k/yr COO consultant.
- **Secondary persona — Yusuf the Agency Principal.** 32, owns a 14-person digital agency. Wants to package his proven internal playbooks into productized retainers but doesn't have the architectural literacy (or 6 weeks of revenue-free time) to do it from scratch. Buys a starter bundle to fork.

Both personas are exhausted by "templates marketplace" SaaS that ships Notion-page screenshots rebranded as SOPs. They reward precision, vertical specificity, and architectural rigor.

---

## 2. Visual positioning

**Wave 2 design refresh (2026-05-08).** VerticalPlaybook is now a **cloud control panel on pristine paper** — the page palette, typography, and surface language are lifted from `tailscale`'s reference DESIGN. The brand essence (operational architecture / SOP-as-software / numbered steps and plate captions) is preserved, but the aesthetic shifts from "transitional-serif printed manual" → "spacious bright SaaS infrastructure clarity": Inter throughout (no serif), Action Red `#D04841` accent in place of cinnabar, soft-shadow surface cards (radius 16-32px), Cloud Mist `#D5D3D2` hairlines.

**Comparable references (not to be cloned):**
- **Tailscale** (the primary reference — Cloud Control Panel on pristine paper, Action Red single accent, soft Inter throughout, lifted directly into tokens)
- **Stripe** (alt reference — architectural blueprint on white marble, palette discipline, hairline use)
- **Vercel** (precise spacing, restrained color, soft shadows)
- **Linear** (high-contrast typography, a single confident accent)
- Otis Elevator engineering drawings — kept as a structural reference for the SOP plate diagram, not a visual reference

**Forbidden territory:**
- Ed-tech orange (Coursera, Udemy, Brilliant)
- Generic SaaS gradient blue (Salesforce-era marketing)
- "Templates marketplace" pastel (Notion-template Etsy aesthetic)
- Anything resembling Anthropic / OpenAI / Vercel / Linear identities directly
- Other Wave 2 sister brands: Render, Cited, Cold Iron, Dispatch, Saltrun, Skyline Watch, Frontline, Brassmark, Triangulate

---

## 3. ShadCN baseline and local component policy

VerticalPlaybook follows the Prin7r baseline: **shadcn/ui** primitives (Tailwind v4 + Radix) added via the registry CLI (`pnpm dlx shadcn@latest add <component>`). After import, the project owns the source.

**In-use ShadCN components for the landing.** `Button`, `Card`, `Badge`, `Accordion`, `Separator`, `Tabs`. All were added via the registry CLI and the source lives at `apps/landing/components/ui/*.tsx`. We restyle via Tailwind utility composition; we do not add a wrapper layer.

**Project-owned local components** (under `apps/landing/components/`):
- `BlueprintHero` — hero with rendered SOP excerpt as architectural drawing
- `VerticalGrid` — 7-up grid of vertical-specific bundles with template counts
- `BundleAnatomy` — anatomy diagram of what's inside a bundle
- `PricingTier` — 3-tier pricing card with NOWPayments CTA
- `SOPPlate` — reusable rendered SOP excerpt with plate caption (used in multiple sections)
- `FAQ` — accordion-driven FAQ
- `Footer` — 4-column footer

**Exceptions to ShadCN baseline.** None. The hero blueprint figure is a hand-crafted SVG, not a UI primitive.

---

## 4. Color tokens

Lifted 2026-05-08 from `design-references/tailscale.md` (Cloud Control Panel). Token NAMES preserved from the v1 cinnabar palette so existing components (`BlueprintHero`, `VerticalGrid`, `BundleAnatomy`, `Pricing`, `FAQ`, `SiteHeader`, `SiteFooter`, `Wordmark`) keep rendering — only VALUES are remapped.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FAFAF8` | Page canvas — milky white (no beige per user rule; tailscale's `Canvas Pale #EEEBEA` is too warm) |
| `--paper-2` | `#F7F5F4` | Surface frost — alt sections, nav background |
| `--ink` | `#181717` | Graphite Black — primary text, headings, primary borders |
| `--graphite` | `#2E2D2D` | Storm Gray — body copy, subheadings |
| `--graphite-2` | `#575555` | Stone Gray — captions, helper text, plate numbers |
| `--rule` | `#D5D3D2` | Cloud Mist — 1px hairlines, dividers |
| `--rule-2` | `#E8E5E3` | Lighter rule — recessed dividers |
| `--cinnabar` | `#D04841` | Action Red — single confident accent · primary CTAs · callouts |
| `--cinnabar-deep` | `#A03A33` | Hover/active for cinnabar elements |
| `--cinnabar-wash` | `#F8E6E5` | Featured pricing tier wash, alert backgrounds |
| `--ochre` | `#5A82DE` | Action Blue Gradient start — secondary tactical highlight (replaces v1 ochre) |
| `--success` | `#2D7A4F` | Status-only — never used for primary CTA |

**Discipline.** Action Red (cinnabar) is the only high-saturation accent on a typical page. Action Blue (ochre token, retoned) appears only inside the hero blueprint figure as a dimension-line color. Success green appears only in inline status badges ("verified" / "active").

---

## 5. Typography

A transitional serif paired with a humanist sans, with a clean monospace for step numbering. All three are Google Fonts so the build is offline-friendly and CDN-fast.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headings | **Source Serif 4** | 400, 600, 700 | Transitional serif. Italic 400 used for section subtitles. |
| Body / UI | **Inter** | 400, 500, 600 | Humanist sans. Tight tracking on small caps. |
| Mono — step numbers, plate refs | **JetBrains Mono** | 400, 500 | Tabular figures on. |

**Type scale** (Tailwind tokens — see `tailwind.config.ts`):

| Role | Size / Leading | Tracking | Family |
|---|---|---|---|
| `text-plate` | 11px / 1.4 | +0.08em | mono caps |
| `text-caption` | 12px / 1.5 | +0.01em | sans |
| `text-body` | 16px / 1.6 | 0 | sans |
| `text-lead` | 19px / 1.55 | 0 | sans |
| `text-h4` | 22px / 1.3 | -0.005em | serif |
| `text-h3` | 28px / 1.25 | -0.01em | serif |
| `text-h2` | 36px / 1.15 | -0.015em | serif |
| `text-h1` | 56px / 1.05 | -0.02em | serif |
| `text-display` | 80px / 1.0 | -0.025em | serif |

**Discipline.** Display weight is 400 with optical kerning, never 700 — the manual-page feel comes from refined letter-shapes, not bold weight. Italic is reserved for section subtitles and figure captions.

---

## 6. Spacing, radius, shadows, and borders

**Base unit:** 4px. **Density:** comfortable.

**Spacing scale.** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 64 / 80 / 96 / 128 / 160. Use these and only these.

**Radius.**
- `--radius-sharp` = 0px — used on the hero figure outline, plate frames (architectural feel)
- `--radius-default` = 4px — buttons, inputs, badges
- `--radius-card` = 6px — pricing cards, FAQ items
- `--radius-pill` = 9999px — only on the verified-status badge

**Shadows.** Used sparingly. The aesthetic is paper, not lifted glass.
- `--shadow-plate` = `0 1px 0 rgba(26, 26, 24, 0.04), 0 0 0 1px rgba(26, 26, 24, 0.06)` — for SOP plates and pricing cards at rest.
- `--shadow-hover` = `0 4px 20px -8px rgba(26, 26, 24, 0.08), 0 0 0 1px rgba(26, 26, 24, 0.12)` — for hover state on pricing tier card and CTA.

**Borders.**
- Hairline `1px solid var(--rule)` — default divider
- Plate frame `1px solid var(--ink)` — used on SOP plates and primary blueprint figure
- Accent rule `2px solid var(--cinnabar)` — used only as the pricing tier "Recommended" highlight

---

## 7. Layout system and responsive rules

**Container.** Max width `1200px` with `padding-inline: clamp(20px, 4vw, 64px)`. The hero figure may bleed to `max-width: 1320px` for visual breathing room.

**Section vertical rhythm.** Sections stack with `padding-block: clamp(80px, 10vw, 128px)` between. Hero is `padding-block-start: 96px` and `padding-block-end: 128px`.

**Grid.**
- Vertical grid: `repeat(7, minmax(0, 1fr))` desktop, `repeat(2, 1fr)` mobile, `repeat(4, 1fr)` md.
- Bundle anatomy: 12-column blueprint with 4 callout columns on desktop, single stacked column ≤768px.
- Pricing: 3-up desktop, 1-up ≤768px, with the recommended tier expanding to 1.05× on md+.

**Breakpoints.** Tailwind defaults: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.

**Discipline at edges.**
- 320px width: hero remains legible, blueprint figure becomes a stacked SVG with no horizontal scroll.
- 768px: vertical grid becomes 4 columns.
- 1024px: full layout assembled.
- 1440px: hero figure gains its full bleed and dimension annotations.

---

## 8. Component catalog

**Buttons.**
- *Primary* — cinnabar fill, paper text, 4px radius, 16px / 24px padding. Hover: `cinnabar-deep`. Used for "Buy Bundle" and "View Vertical."
- *Secondary* — paper-2 fill, ink text, 1px ink border, 4px radius. Hover: `paper-2 → paper`, border darkens. Used for "See sample SOP."
- *Ghost* — transparent, ink text, 0 padding. Used in nav and inline links.

**Cards.**
- *Plate Card* — paper fill, 1px rule border, 6px radius. 32px padding. Top "PLATE 04 / SOP" plate caption in mono caps, ink. Used for SOP excerpts and bundle anatomy callouts.
- *Vertical Card* — paper fill, 1px rule border, hover lifts to `--shadow-hover`, 24px padding, vertical glyph (16px), vertical name in serif h4, count in mono caption.
- *Pricing Tier Card* — paper fill, 6px radius, 1px rule border. The "Vertical Pack" recommended tier gains `border: 2px solid var(--cinnabar)` and a "Recommended" plate-caption ribbon at top-right.

**Badges.**
- *Verified* — paper-2 fill, ink text, 9999px radius, 6px / 10px padding, 11px text. Used for "Live invoice verified."
- *Plate caption* — mono caps, 11px, +0.08em tracking, graphite-2 color, no fill. Used for figure plate numbers.

**Inputs.**
- *Text input* — paper fill, 1px rule border, 4px radius, 12px / 16px padding, focus ring `0 0 0 2px var(--cinnabar-wash)`. Used in nav search (deferred — not on landing) and in any future contact form.

**Accordion (FAQ).**
- 1px rule top border, paper fill, 24px / 0 padding, h4 serif title, body sans copy. Open state: `+` glyph rotates to `−`, no chevron.

**Separator.**
- 1px solid `var(--rule)`. We use it explicitly between major sections, never the default ShadCN gray.

---

## 9. Landing page structure

The landing page is a single file (`apps/landing/app/page.tsx`) composed of these sections in order. All copy is real, sourced from `docs/08-marketing-strategy.md`.

1. **Top bar.** VerticalPlaybook wordmark (serif italic) + 5 nav items (Verticals, Bundles, How it works, Pricing, FAQ) + secondary "Buy Bundle" CTA.
2. **Hero.** Two-column on lg+. Left: kicker "PLATE 01 — VERTICAL OPS BUNDLES", h1 "The operational system you wish came in the box.", lead paragraph, primary + secondary CTA, sub-line ("Verified live unpaid invoice — checkout in <30s"). Right: the hero blueprint figure — a real SOP excerpt rendered as architectural drawing. Numbered steps, hairline rules, dimension callouts in ochre.
3. **Vertical grid.** 7 verticals: HVAC, Dental practices, Accounting firms, DTC ecommerce, Real-estate brokerage, SaaS support, Marketing agencies. Each card shows count of templates ("28 SOPs / 14 automations / 9 n8n flows / 4 prompt packs"). Click → product detail (deferred to Wave 3 — for Wave 2 the click opens a hash anchor with bundle anatomy).
4. **Bundle anatomy.** "What's in a bundle" — 4 columns (SOPs / Automations / n8n flows / Prompt packs) each with 3-bullet callouts and a small SOP plate excerpt as illustration.
5. **Pricing.** 3 tiers: Single Bundle ($249) / Vertical Pack ($1,490) / Enterprise ($9,800). Each has the NOWPayments hosted-invoice CTA wired to `POST /api/checkout/nowpayments` and redirected to the hosted invoice URL. Vertical Pack is the recommended tier.
6. **FAQ.** 6 items: integration time, n8n flow compatibility, license terms, support level, customization, refund policy.
7. **Footer.** 4 columns: Verticals / Product / Company / Legal. Wordmark + plate caption "VerticalPlaybook / Prin7r 2026" at bottom.

---

## 10. Imagery and generated asset rules

**No photography.** The brand depends on architectural drawings and rendered SOP excerpts, not stock photography or hero illustrations. Photography would dilute the manual-page feel.

**SVG-first.** All hero, anatomy, and section illustrations are inline SVG built into the React components. No raster image files except the favicon and the OG image.

**Generated imagery.** Not used in v1. If we later want a hero variant, the rule is: GPT Image 2 prompt must specify "engineering blueprint, white marble paper background #FAFAF8, hairline 1px black rules, single cinnabar #C8472B accent, no gradients, no glow, no perspective lines, top-down orthographic only." Saved at `apps/landing/public/generated/<filename>` with a sibling `.prompt.txt`.

**OG image.** `apps/landing/public/og.png` — 1200×630 PNG of the wordmark + tagline + a single cinnabar plumb-line accent. Generated via the same SVG → PNG pipeline (deferred to polish pass; for now we ship without OG and rely on default favicon).

**Favicon.** `apps/landing/public/favicon.svg` — single cinnabar dot at the bottom of a black plumb line on paper.

---

## 11. Motion and interaction rules

**Restraint.** We do not animate hero blueprint elements, do not parallax, do not autoplay anything. The brand is *paper* — paper does not animate. Two exceptions:

1. **Hover lift.** Vertical cards and pricing tier cards transition `box-shadow` over 180ms ease-out and translate -1px on Y.
2. **Accordion expand.** FAQ items animate height and `+/−` glyph rotation over 200ms ease-out.

**No scroll-driven effects.** No fade-in-on-scroll, no sticky parallax, no scroll-snap. The page reads top-to-bottom like a manual.

**Focus states.** All interactive elements show a `2px solid var(--cinnabar)` outline with 2px offset on `:focus-visible`. Tab order: skip link → nav → primary CTA → secondary CTA → vertical grid (left-right top-down) → pricing tiers → FAQ → footer.

**Reduced motion.** `prefers-reduced-motion: reduce` disables all transitions on hover/expand. The page works identically.

---

## 12. Accessibility and quality gates

**WCAG.** Targeting WCAG 2.1 AA across the landing.

**Color contrast.** All ink-on-paper text reaches 14.5:1+. Cinnabar on paper for body text not used (cinnabar is reserved for CTAs and accent only); cinnabar-on-paper as a button background with paper text reaches 4.6:1 — passes AA for non-text large fill, and passes 4.5:1 minimum for normal text.

**Keyboard.** Every interactive element reachable via Tab. Skip-link from top of page → main. CTA labels are full sentences ("Buy single bundle — $249") not "click here."

**Screen reader.** Hero blueprint figure has `role="img"` and `aria-label="Sample SOP excerpt: HVAC fall-startup checklist, 7 numbered steps with safety callouts."` Decorative SVG elements set `aria-hidden="true"`.

**Mobile.** Tested at 320px, 390px, 768px, 1024px, 1440px. No horizontal scroll. Tap targets ≥44px.

**Lighthouse target.** Performance ≥95, Accessibility ≥98, Best Practices ≥95, SEO ≥95 on production.

---

## 13. Screenshots and verification artifacts

These artifacts must be present and current before any landing change ships:

- `docs/screenshots/landing-desktop.png` — 1440×900 production render
- `docs/screenshots/landing-mobile.png` — 390×844 production render

Both captured via the Prin7r shared Playwright harness at `/tmp/prin7r-screenshots/capture.mjs` against the deployed URL, NOT localhost. After capture they are committed to the repo and verified via `gh api repos/prin7r-projects/industry-process-templates/contents/docs/screenshots`.

**Verification log.** Each release appends to the changelog (section 15) with the deployed URL, the live unpaid-invoice id from the NOWPayments hosted-checkout flow, and the screenshot capture timestamp.

---

## 14. External references and library sources

- ShadCN/ui — `https://ui.shadcn.com/` — primitives via registry
- Radix UI — primitives layered under shadcn
- Tailwind CSS v4 — utility composition
- Source Serif 4, Inter, JetBrains Mono — Google Fonts
- Refero Styles gallery — `https://styles.refero.design/` — DESIGN.md inspiration
- Stripe DESIGN.md (Prin7r design-references) — palette discipline reference, not a clone target
- NOWPayments API — `POST /v1/invoice` — hosted checkout
- payments-prototypes (Prin7r monorepo) — pattern reference for `apps/landing/lib/checkout.ts` and webhook handler

---

## 15. Changelog

- **2026-05-08** — Initial DESIGN.md authored alongside landing build. Brand "VerticalPlaybook" established. Cinnabar `#C8472B` accent on paper `#FAFAF8`. Source Serif 4 + Inter + JetBrains Mono pairing. 7-vertical grid, 3-tier pricing with NOWPayments hosted invoice CTA. Live deploy at `https://industry-process-templates.prin7r.com`. Screenshots captured at deploy + 5min.
- **2026-05-08 (rebrand)** — Brand renamed from **Plumbline** → **VerticalPlaybook** to avoid live SaaS collision with `plumblineconsulting.com` (Microsoft Dynamics 365 vertical-SaaS add-on, direct same-category competitor) and `plumblineanswers.org` (call-answering for trades, adjacent collision). New domain `verticalplaybook.com` (verified available). The architectural metaphor — vertical line + cinnabar bead glyph — is preserved (still reads as a plumb line geometrically), but the brand essence shifts from "plumb line measurement instrument" → "vertical playbook / industry-specific operational architecture." Wordmark monogram updates: V (or Vp) replaces P. All source/docs/Notion synchronously updated; tokens, palette, typography, and component layouts unchanged.
