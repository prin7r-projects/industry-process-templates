export type Tier = {
  id: "single" | "vertical-pack" | "enterprise";
  name: string;
  price: number;
  priceLabel: string;
  trail: string;
  features: string[];
  recommended?: boolean;
  ctaLabel: string;
};

export const tiers: Tier[] = [
  {
    id: "single",
    name: "Single Bundle",
    price: 249,
    priceLabel: "$249",
    trail: "One vertical. 24–32 SOPs. 12 months of updates.",
    features: [
      "All SOPs in one vertical (24–32 docs)",
      "All automations + n8n flow exports",
      "All prompt packs in that vertical",
      "12 months of bundle updates",
      "Email support, 72-hour response",
    ],
    ctaLabel: "Buy single bundle",
  },
  {
    id: "vertical-pack",
    name: "Vertical Pack",
    price: 1490,
    priceLabel: "$1,490",
    trail: "Three bundles in one vertical theme. Quarterly office hours.",
    features: [
      "Everything in Single Bundle, ×3",
      "Cross-bundle integration playbook",
      "Quarterly office hour with vertical operators",
      "Priority support, 24-hour response",
      "Up to 100 internal users",
    ],
    recommended: true,
    ctaLabel: "Buy vertical pack",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 9800,
    priceLabel: "$9,800",
    trail: "5–10 bundles. Three-week embedded deploy.",
    features: [
      "5–10 bundles selected with you",
      "3-week white-glove deployment",
      "Embedded operator throughout",
      "Bundle co-authoring rights — 1 net-new bundle",
      "Organizational seat across geographies",
    ],
    ctaLabel: "Start enterprise checkout",
  },
];
