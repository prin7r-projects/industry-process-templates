import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy — VerticalPlaybook",
  description:
    "VerticalPlaybook privacy notice. What we collect, how we use it, who we share it with, and how to delete your data.",
};

/**
 * PRI-3730: replaces the footer "Privacy" link that previously pointed
 * at href="#". Statement matches the Wave 2 minimal data posture —
 * only email + payment metadata for buyers; no analytics SDKs; no
 * marketing pixels.
 */
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page section-rhythm max-w-[820px]">
        <header className="mb-10">
          <p className="plate-caption mb-4">LEGAL — PRIVACY</p>
          <h1 className="font-serif text-h1 lg:text-[56px] text-ink mb-4 leading-[1.05] tracking-[-0.02em]">
            Privacy notice.
          </h1>
          <p className="text-lead text-graphite max-w-[60ch]">
            Effective 2026-06-02. We collect the minimum needed to deliver bundles,
            process payments, and respond to support requests.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">What we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-body text-graphite max-w-[62ch]">
            <li>
              <strong className="text-ink">Marketing site visits.</strong> Server access
              logs only (IP, user agent, referrer). No marketing pixels, no third-party
              analytics SDKs, no fingerprinting.
            </li>
            <li>
              <strong className="text-ink">Purchase metadata.</strong> Order id, tier,
              vertical, NOWPayments invoice id, payment status. NOWPayments handles the
              cryptocurrency wallet and card-on-ramp data directly — we never see card
              numbers or full wallet histories.
            </li>
            <li>
              <strong className="text-ink">Account email.</strong> If you create a customer
              account to access bundle downloads or licenses, we store your email and a
              salted hash of your password.
            </li>
            <li>
              <strong className="text-ink">Support correspondence.</strong> Emails you send
              to{" "}
              <a className="underline text-ink hover:text-cinnabar" href="mailto:hello@verticalplaybook.com">
                hello@verticalplaybook.com
              </a>{" "}
              or{" "}
              <a className="underline text-ink hover:text-cinnabar" href="mailto:support@verticalplaybook.com">
                support@verticalplaybook.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">How we use it</h2>
          <ul className="list-disc pl-5 space-y-2 text-body text-graphite max-w-[62ch]">
            <li>Deliver bundles and license keys to paying customers.</li>
            <li>Issue refunds and respond to support tickets.</li>
            <li>Comply with tax and bookkeeping obligations (orders retained 7 years).</li>
            <li>Notify you of bundle updates inside your purchased verticals.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">Who we share with</h2>
          <ul className="list-disc pl-5 space-y-2 text-body text-graphite max-w-[62ch]">
            <li>
              <strong className="text-ink">NOWPayments</strong> — payment processor for
              hosted invoice + cryptocurrency settlement. Their{" "}
              <a className="underline text-ink hover:text-cinnabar" href="https://nowpayments.io/privacy-policy">
                privacy policy
              </a>{" "}
              governs the data you submit in their checkout.
            </li>
            <li>
              <strong className="text-ink">Our hosting infrastructure</strong> — Hetzner
              (EU), Prin7r operated.
            </li>
            <li>
              <strong className="text-ink">No data sale.</strong> We do not sell your data
              and we do not run ads.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-serif text-h3 text-ink mb-3">Your rights</h2>
          <p className="text-body text-graphite mb-3 max-w-[60ch]">
            You can request export, correction, or deletion of any personal data we hold by
            emailing{" "}
            <a className="underline text-ink hover:text-cinnabar" href="mailto:hello@verticalplaybook.com">
              hello@verticalplaybook.com
            </a>
            . We respond inside 30 days. Order and tax records are retained for the
            statutory 7-year period even after account deletion.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-h3 text-ink mb-3">Questions</h2>
          <p className="text-body text-graphite max-w-[60ch]">
            See the{" "}
            <Link className="underline text-ink hover:text-cinnabar" href="/contact">
              contact page
            </Link>{" "}
            or email{" "}
            <a className="underline text-ink hover:text-cinnabar" href="mailto:hello@verticalplaybook.com">
              hello@verticalplaybook.com
            </a>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
