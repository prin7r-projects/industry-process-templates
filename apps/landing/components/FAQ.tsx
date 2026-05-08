import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    q: "How long until the first SOP is running?",
    a: "Most buyers have the first SOP running by Friday of the week they buy. The bundle ships with a Day-1 deploy checklist as the first SOP — opening it tells you what to do that day. The full bundle deploys inside a week for a typical operator.",
  },
  {
    q: "Are the n8n flows compatible with self-hosted n8n?",
    a: "Yes. The bundle ships JSON workflow exports. They import into self-hosted n8n, n8n.cloud, and any n8n-compatible runtime. Credentials are abstracted — you wire them up in your own n8n instance, never embedded in the export.",
  },
  {
    q: "What does the license actually cover?",
    a: "Single-implementation license. You may freely use bundle artifacts inside your own business — including modifying, customizing, and operating them. You may not redistribute the bundle artifacts to other parties, repackage and resell them, or list adapted versions on a templates marketplace. Agency principals: you can use bundle-derived SOPs in your client engagements, but each client implementation requires the agency to have purchased the bundle. We're working on a Reseller tier for Wave 4.",
  },
  {
    q: "How does the support level differ across tiers?",
    a: "Single Bundle: email support, 72-hour response. Vertical Pack: priority email + quarterly group office hour, 24-hour response. Enterprise: 8-hour response, 12 months priority support, plus a 3-week embedded operator during deployment.",
  },
  {
    q: "Can I customize the SOPs and still get updates?",
    a: "Yes. Bundles ship as markdown SOPs and JSON workflows — both diffable. Quarterly updates ship with a 1-page diff highlighting what changed. You merge selectively into your customized fork. We don't clobber your customizations.",
  },
  {
    q: "What's the refund policy?",
    a: "30-day no-questions refund on Single Bundles and Vertical Packs. We process the refund as a NOWPayments stablecoin reversal back to the wallet you paid from, within 5 business days. Enterprise tier refunds follow the contract terms agreed at signing.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="bg-paper-2 border-y border-rule section-rhythm"
      aria-labelledby="faq-heading"
    >
      <div className="container-page max-w-[900px]">
        <header className="mb-12 md:mb-16">
          <p className="plate-caption mb-4">PLATE 06 — FREQUENTLY ASKED</p>
          <h2
            id="faq-heading"
            className="font-serif text-h2 lg:text-[48px] text-ink leading-[1.1] tracking-[-0.015em]"
          >
            Frequently asked.
          </h2>
        </header>

        <Accordion type="single" collapsible className="border-b border-rule">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
