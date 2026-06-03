import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "License — VerticalPlaybook",
  description:
    "VerticalPlaybook bundle licensing terms. Single-implementation license, no resale, no redistribution.",
};

/**
 * PRI-3730: replaces the footer "License" link that previously pointed
 * at href="#". The wording is sourced from the FAQ answer authored at
 * `apps/landing/components/FAQ.tsx` to keep one canonical statement.
 */
export default function LicensePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page section-rhythm max-w-[820px]">
        <header className="mb-10">
          <p className="plate-caption mb-4">LEGAL — LICENSE</p>
          <h1 className="font-serif text-h1 lg:text-[56px] text-ink mb-4 leading-[1.05] tracking-[-0.02em]">
            Bundle license.
          </h1>
          <p className="text-lead text-graphite max-w-[60ch]">
            Single-implementation use license. Plain English first, formal terms second.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">Plain English</h2>
          <ul className="list-disc pl-5 space-y-2 text-body text-graphite max-w-[62ch]">
            <li>
              You may use bundle artifacts (SOPs, automations, n8n flow JSON, prompt packs)
              freely inside your own business. Modify, customize, and operate them however
              you need.
            </li>
            <li>
              You may not redistribute the bundle artifacts to other parties, repackage and
              resell them, or list adapted versions on a templates marketplace.
            </li>
            <li>
              Agencies may use bundle-derived SOPs in their client engagements, but each
              client implementation requires the agency to have purchased the bundle. A
              Reseller tier is on the Wave 4 roadmap.
            </li>
            <li>
              Refunds: 30 days, no questions asked on Single Bundles and Vertical Packs.
              Stablecoin reversal back to the wallet you paid from within 5 business days.
              Enterprise tier refunds follow the contract terms agreed at signing.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">Formal terms</h2>
          <ol className="list-decimal pl-5 space-y-3 text-body text-graphite max-w-[62ch]">
            <li>
              <strong className="text-ink">Grant.</strong> Subject to payment of the applicable
              fee, Prin7r grants the purchaser a non-exclusive, non-transferable,
              single-implementation license to use, modify, and operate the bundle
              artifacts inside the purchaser&rsquo;s business.
            </li>
            <li>
              <strong className="text-ink">Restrictions.</strong> No redistribution,
              sublicensing, resale, or public hosting of unmodified or substantially
              similar bundle artifacts. No use of bundle artifacts to train AI models for
              commercial offering.
            </li>
            <li>
              <strong className="text-ink">Updates.</strong> 12 months of bundle updates
              ship with each purchase. Updates are delivered as 1-page diffs you merge
              into your customized fork.
            </li>
            <li>
              <strong className="text-ink">Warranty.</strong> Bundles are provided
              &ldquo;as-is&rdquo; without warranty of fitness for a particular purpose.
              Liability is capped at the bundle purchase price.
            </li>
            <li>
              <strong className="text-ink">Code license.</strong> The landing site and
              Wasp/open-saas application source code are MIT-licensed (see the{" "}
              <a
                className="underline text-ink hover:text-cinnabar"
                href="https://github.com/prin7r-projects/industry-process-templates/blob/main/LICENSE"
              >
                repository LICENSE file
              </a>
              ). The license on this page applies to the bundle artifacts, not the
              platform source.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-h3 text-ink mb-3">Questions</h2>
          <p className="text-body text-graphite max-w-[60ch]">
            Email{" "}
            <a className="underline text-ink hover:text-cinnabar" href="mailto:hello@verticalplaybook.com">
              hello@verticalplaybook.com
            </a>{" "}
            or visit the{" "}
            <Link className="underline text-ink hover:text-cinnabar" href="/contact">
              contact page
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
