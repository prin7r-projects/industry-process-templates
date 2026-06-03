import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact — VerticalPlaybook",
  description:
    "Reach the VerticalPlaybook team for sales, bundle requests, support, or manual checkout. PRI-3730: visible contact path for buyers when online checkout is unavailable.",
};

const CONTACT_EMAIL = "hello@verticalplaybook.com";
const SUPPORT_EMAIL = "support@verticalplaybook.com";

/**
 * PRI-3730: visible, public contact path. Linked from the site header,
 * the footer Company column, and the pricing CTA fallback so buyers
 * always have a non-checkout way to reach the team.
 *
 * The page is intentionally static (no `use client`, no forms) so it
 * works under the Next.js standalone runtime without any extra
 * server/state dependencies.
 */
export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page section-rhythm">
        <header className="max-w-[700px] mb-12">
          <p className="plate-caption mb-4">PLATE 07 — CONTACT</p>
          <h1 className="font-serif text-h1 lg:text-[56px] text-ink mb-4 leading-[1.05] tracking-[-0.02em]">
            Talk to the team.
          </h1>
          <p className="text-lead text-graphite max-w-[58ch]">
            VerticalPlaybook is run by the Prin7r operator team. The fastest way to reach
            us is email — we read every message and reply inside one business day.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mb-12">
          <ContactCard
            title="Sales &amp; bundle requests"
            email={CONTACT_EMAIL}
            blurb="Buying a bundle, requesting a custom vertical, or asking about reseller terms. Manual checkout for buyers whose online flow returned an error."
          />
          <ContactCard
            title="Customer support"
            email={SUPPORT_EMAIL}
            blurb="Existing customers: bundle download issues, license activation, integration help. SLA: Single 72h · Vertical Pack 24h · Enterprise 8h."
          />
        </div>

        <section className="max-w-[760px] mb-12">
          <h2 className="font-serif text-h3 text-ink mb-4">If online checkout fails</h2>
          <p className="text-body text-graphite mb-4 max-w-[60ch]">
            When the pricing page CTA returns &ldquo;Online checkout is temporarily unavailable&rdquo;
            it means the NOWPayments hosted-invoice key is not configured on this
            environment. We never silently route buyers through a simulated flow.
            Email <a className="underline text-ink hover:text-cinnabar" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            with the tier you want and we will send a manual NOWPayments invoice within
            one business day.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-body text-graphite max-w-[60ch]">
            <li>Single Bundle — $249 · one vertical, 24–32 SOPs</li>
            <li>Vertical Pack — $1,490 · three bundles per vertical theme</li>
            <li>Enterprise — $9,800 · 5–10 bundles + 3-week embedded deploy</li>
          </ul>
        </section>

        <section className="max-w-[760px]">
          <h2 className="font-serif text-h3 text-ink mb-4">Company</h2>
          <p className="text-body text-graphite mb-4 max-w-[60ch]">
            VerticalPlaybook is a product of Prin7r. The repository and the bundle source
            live on{" "}
            <a
              className="underline text-ink hover:text-cinnabar"
              href="https://github.com/prin7r-projects/industry-process-templates"
            >
              github.com/prin7r-projects/industry-process-templates
            </a>
            . See the{" "}
            <Link className="underline text-ink hover:text-cinnabar" href="/legal/license">
              license
            </Link>
            ,{" "}
            <Link className="underline text-ink hover:text-cinnabar" href="/legal/privacy">
              privacy notice
            </Link>
            , and{" "}
            <a className="underline text-ink hover:text-cinnabar" href="/docs/pitch-deck.html">
              pitch deck
            </a>{" "}
            for more.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ContactCard({
  title,
  email,
  blurb,
}: {
  title: string;
  email: string;
  blurb: string;
}) {
  return (
    <div className="bg-paper border border-rule rounded-card p-6">
      <h3
        className="font-serif text-h4 text-ink mb-2"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-caption text-graphite leading-relaxed mb-4">{blurb}</p>
      <a
        href={`mailto:${email}`}
        className="text-body font-medium text-ink underline hover:text-cinnabar"
      >
        {email}
      </a>
    </div>
  );
}
