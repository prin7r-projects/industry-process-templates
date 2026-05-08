export function BundleAnatomy() {
  return (
    <section
      id="anatomy"
      className="bg-paper-2 border-y border-rule section-rhythm"
      aria-labelledby="anatomy-heading"
    >
      <div className="container-page">
        <header className="max-w-[700px] mb-14 md:mb-20">
          <p className="plate-caption mb-4">PLATE 03 — BUNDLE ANATOMY</p>
          <h2
            id="anatomy-heading"
            className="font-serif text-h2 lg:text-[48px] text-ink mb-4 leading-[1.1] tracking-[-0.015em]"
          >
            What's in a bundle.
          </h2>
          <p className="text-lead text-graphite max-w-[55ch]">
            Four artifact classes. All diffable. All deployable. Each bundle ships with a Day-1 deploy checklist as the first SOP, so the path to first value is the first thing you see when you open the .zip.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
          {anatomyParts.map((part, i) => (
            <article key={part.title} className="bg-paper p-7 flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <span className="plate-caption">PART 0{i + 1}</span>
                <span className="font-mono text-[11px] text-graphite-2 tabular-nums">{part.count}</span>
              </div>
              <h3 className="font-serif text-h4 text-ink">{part.title}</h3>
              <p className="text-caption text-graphite leading-relaxed">{part.summary}</p>
              <ul className="mt-auto space-y-2 pt-4 border-t border-rule-2">
                {part.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-caption text-graphite leading-snug">
                    <span className="text-cinnabar font-mono mt-0.5" aria-hidden="true">→</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 max-w-[700px]">
          <p className="text-caption text-graphite-2">
            <span className="plate-caption text-ink">A NOTE ON COMPOSABILITY · </span>
            Bundles are markdown SOPs and JSON workflows — both diffable. Updates ship with a 1-page diff so you can merge selectively. Your customizations don't get clobbered.
          </p>
        </div>
      </div>
    </section>
  );
}

const anatomyParts = [
  {
    title: "SOPs",
    count: "24–32 docs",
    summary:
      "Markdown documents written by operators in the vertical. Every SOP names the trigger, the responsible role, the steps, the exception paths, and the artifact left behind.",
    bullets: [
      "Triggered, role-owned, exception-mapped",
      "ServiceTitan / Dentrix / NetSuite hooks where relevant",
      "Day-1 deploy checklist always ships first",
    ],
  },
  {
    title: "Automations",
    count: "12–16 scripts",
    summary:
      "Make.com / Zapier / direct-webhook scripts. Each is documented with what triggers it, what it does, and how it fails gracefully when an upstream API blips.",
    bullets: [
      "Idempotent retry semantics",
      "Documented failure modes per integration",
      "Drop-in env-var configuration",
    ],
  },
  {
    title: "n8n flows",
    count: "9–11 JSON",
    summary:
      "n8n workflow JSON exports. Importable into self-hosted, n8n.cloud, or any compatible runtime. Versioned with the bundle; diffable across releases.",
    bullets: [
      "Self-hosted and n8n.cloud compatible",
      "Credentials abstracted — never embedded",
      "Smoke-test fixtures included",
    ],
  },
  {
    title: "Prompt packs",
    count: "3–5 .json",
    summary:
      "Vetted prompt libraries for the LLM workflows that show up in this vertical. Dispatch triage. Customer-call summary. End-of-day reconciliation. Each prompt named, versioned, and tested.",
    bullets: [
      "Model-agnostic — swap providers safely",
      "Versioned with rollback notes",
      "Bench fixtures for regression",
    ],
  },
];
