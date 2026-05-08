import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule py-16 md:py-20" aria-labelledby="footer-heading">
      <div className="container-page">
        <h2 id="footer-heading" className="sr-only">
          Footer navigation
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-12">
          <FooterColumn
            title="Verticals"
            items={[
              { label: "HVAC services", href: "#verticals" },
              { label: "Dental practices", href: "#verticals" },
              { label: "Accounting firms", href: "#verticals" },
              { label: "DTC ecommerce", href: "#verticals" },
              { label: "Real-estate brokerage", href: "#verticals" },
              { label: "SaaS support", href: "#verticals" },
              { label: "Marketing agencies", href: "#verticals" },
            ]}
          />
          <FooterColumn
            title="Product"
            items={[
              { label: "Bundle anatomy", href: "#anatomy" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Sample SOPs", href: "#anatomy" },
            ]}
          />
          <FooterColumn
            title="Company"
            items={[
              { label: "Pitch deck", href: "/docs/pitch-deck.html" },
              { label: "Repo", href: "https://github.com/prin7r-projects/industry-process-templates" },
              { label: "Notion opportunity", href: "https://www.notion.so/Industry-process-templates-3543ceec26198166b90ac8df25836629" },
            ]}
          />
          <FooterColumn
            title="Legal"
            items={[
              { label: "License", href: "#" },
              { label: "Refund policy", href: "#faq" },
              { label: "Privacy", href: "#" },
            ]}
          />
        </div>

        <div className="border-t border-rule pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Wordmark size="sm" />
          <p className="plate-caption">
            VERTICALPLAYBOOK · OPERATIONAL ARCHITECTURE FOR THE VERTICALS THAT BUILD THE WORLD · PRIN7R 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="plate-caption mb-4 text-ink">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-caption text-graphite hover:text-cinnabar transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
