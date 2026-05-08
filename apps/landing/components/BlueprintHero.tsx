import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

/**
 * The hero blueprint figure — a real SOP excerpt rendered as architectural drawing.
 * SOP source: HVAC bundle "Fall startup checklist — residential, 5-30 trucks"
 * Numbered steps, hairline rules, dimension callouts in ochre. Sharp 0px corners.
 */
export function BlueprintHero() {
  return (
    <section
      className="container-wide pt-16 pb-20 md:pt-20 md:pb-24 lg:pt-24 lg:pb-32"
      aria-labelledby="hero-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-6 xl:col-span-5 max-w-[640px]">
          <p className="plate-caption mb-6">PLATE 01 — VERTICAL OPS BUNDLES</p>

          <h1
            id="hero-heading"
            className="font-serif text-[42px] sm:text-h1 md:text-[64px] lg:text-h1 xl:text-[64px] leading-[1.05] tracking-[-0.02em] text-ink mb-6"
          >
            The operational system you wish came in the box.
          </h1>

          <p className="text-lead text-graphite mb-8 max-w-[58ch]">
            Pick your vertical. Get 24–32 SOPs, 12–16 automations, 9 n8n flows, and 3–5 prompt packs — calibrated for your industry's real operators. Drops into your stack inside a day. You'll be running it by Friday.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button asChild variant="primary" size="lg">
              <a href="#pricing">Buy a bundle</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#anatomy">See what's in a bundle</a>
            </Button>
          </div>

          <div className="flex items-center gap-3 text-caption text-graphite-2">
            <Badge variant="verified">
              <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
              Live unpaid invoice verified
            </Badge>
            <span>Checkout in &lt;30s · USDT / USDC / card on-ramp</span>
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-7">
          <SOPBlueprintFigure />
        </div>
      </div>
    </section>
  );
}

function SOPBlueprintFigure() {
  return (
    <figure
      className="relative bg-paper border border-ink shadow-plate"
      role="img"
      aria-label="Sample SOP excerpt: HVAC fall startup checklist, seven numbered steps with safety callouts and dimension annotations."
    >
      {/* Plate caption header */}
      <div className="border-b border-ink px-6 py-3 flex items-center justify-between bg-paper-2">
        <span className="plate-caption">PLATE 04 — SOP / HVAC FALL STARTUP CHECKLIST</span>
        <span className="plate-caption">v1.0 · §3.2 · 7 STEPS</span>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-8 py-8 sm:py-10">
        {/* Title block */}
        <div className="mb-8">
          <h3 className="font-serif text-h3 text-ink mb-2">Pre-season system commissioning</h3>
          <p className="text-caption text-graphite-2">
            Trigger: <span className="text-graphite">Last week of August</span> · Owner: <span className="text-graphite">Lead Tech</span> · Artifact: <span className="text-graphite">Signed checklist + photos in ServiceTitan</span>
          </p>
        </div>

        {/* Steps */}
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="grid grid-cols-[36px_1fr] gap-4 items-start">
              <span className="font-mono text-[13px] tracking-tight text-graphite-2 pt-0.5 tabular-nums select-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="border-b border-rule-2 pb-4 last:border-b-0">
                <p className="text-[15px] text-ink leading-snug">
                  <span className="font-medium">{s.head}</span>
                  <span className="text-graphite"> — {s.body}</span>
                </p>
                {s.callout && (
                  <p className="mt-2 plate-caption text-ochre">
                    {s.callout}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Footer dimension annotations */}
        <div className="mt-10 grid grid-cols-3 gap-4 pt-5 border-t border-rule-2">
          <div>
            <div className="plate-caption mb-1">SLA</div>
            <div className="font-mono text-sm text-ink tabular-nums">≤ 90 min</div>
          </div>
          <div>
            <div className="plate-caption mb-1">CHECKLIST RUNS</div>
            <div className="font-mono text-sm text-ink tabular-nums">2 / yr / unit</div>
          </div>
          <div>
            <div className="plate-caption mb-1">REGULATORY</div>
            <div className="font-mono text-sm text-ink tabular-nums">EPA 608 ref</div>
          </div>
        </div>
      </div>
    </figure>
  );
}

const steps: { head: string; body: string; callout?: string }[] = [
  {
    head: "Pull permit and customer signed agreement",
    body: "Confirm last-season notes in ServiceTitan; flag any open warranty.",
  },
  {
    head: "Visual inspection: condenser, lineset, coil",
    body: "Photo each side; upload to ServiceTitan job notes.",
    callout: "// SAFETY: lockout tag at disconnect before contact",
  },
  {
    head: "Refrigerant pressure read",
    body: "Compare to manufacturer spec sheet pinned to job; log delta.",
  },
  {
    head: "Capacitor µF reading",
    body: "Replace if reading is &lt;6% of nameplate; document part SKU.",
  },
  {
    head: "Drain line clear and pan flush",
    body: "5-gallon flush; verify exit at termination point with photo.",
  },
  {
    head: "Thermostat calibration and customer walkthrough",
    body: "Reset schedule; confirm wifi connection; capture customer signature on tablet.",
    callout: "// AUTO: invoice + photos sync to ServiceTitan within 60s",
  },
  {
    head: "Update equipment record + schedule fall follow-up",
    body: "Tag any deferred recommendations; queue 30-day follow-up call.",
  },
];
