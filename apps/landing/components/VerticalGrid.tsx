import { verticals } from "@/lib/verticals";

export function VerticalGrid() {
  return (
    <section
      id="verticals"
      className="container-page section-rhythm border-t border-rule"
      aria-labelledby="verticals-heading"
    >
      <header className="max-w-[700px] mb-14 md:mb-16">
        <p className="plate-caption mb-4">PLATE 02 — VERTICALS</p>
        <h2
          id="verticals-heading"
          className="font-serif text-h2 lg:text-[48px] text-ink mb-4 leading-[1.1] tracking-[-0.015em]"
        >
          Pick your vertical.
        </h2>
        <p className="text-lead text-graphite max-w-[55ch]">
          Seven launch verticals. Each bundle written by an operating expert in that vertical, with a real reference business pinned. If your business doesn't match the fit definition, the bundle won't help — and we'll say so.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-px bg-rule border border-rule rounded-card overflow-hidden">
        {verticals.map((v) => (
          <li key={v.id} className="bg-paper">
            <article className="h-full p-6 flex flex-col gap-4 hover:bg-paper-2 transition-colors duration-200 group cursor-default">
              <div className="flex items-start justify-between">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-ink group-hover:text-cinnabar transition-colors" aria-hidden="true">
                  <path d={v.glyph} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <span className="plate-caption">0{verticals.indexOf(v) + 1}</span>
              </div>
              <div>
                <h3 className="font-serif text-h4 text-ink leading-tight mb-2">{v.name}</h3>
                <p className="text-caption text-graphite-2 leading-snug">
                  {v.fitDefinition}
                </p>
              </div>
              <dl className="mt-auto pt-4 border-t border-rule grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px] tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-graphite-2">SOPs</dt>
                  <dd className="text-ink">{v.sops}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-graphite-2">Auto</dt>
                  <dd className="text-ink">{v.automations}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-graphite-2">n8n</dt>
                  <dd className="text-ink">{v.flows}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-graphite-2">Pmpt</dt>
                  <dd className="text-ink">{v.promptPacks}</dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
