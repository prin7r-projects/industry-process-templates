export type Vertical = {
  id: string;
  name: string;
  fitDefinition: string;
  sops: number;
  automations: number;
  flows: number;
  promptPacks: number;
  glyph: string; // single line svg path string
};

export const verticals: Vertical[] = [
  {
    id: "hvac",
    name: "HVAC services",
    fitDefinition: "$2M–$25M residential, 5–30 trucks. ServiceTitan-friendly.",
    sops: 28,
    automations: 14,
    flows: 9,
    promptPacks: 4,
    glyph: "M4 18 L20 18 L20 8 L12 4 L4 8 Z",
  },
  {
    id: "dental",
    name: "Dental practices",
    fitDefinition: "1–3 location group practices on Dentrix or Eaglesoft.",
    sops: 26,
    automations: 12,
    flows: 9,
    promptPacks: 3,
    glyph: "M12 4 C7 4 5 8 5 12 C5 16 7 20 9 20 C10 20 11 18 12 18 C13 18 14 20 15 20 C17 20 19 16 19 12 C19 8 17 4 12 4 Z",
  },
  {
    id: "accounting",
    name: "Accounting firms",
    fitDefinition: "5–30 partner CPA firms. QuickBooks / Xero / NetSuite.",
    sops: 30,
    automations: 13,
    flows: 9,
    promptPacks: 5,
    glyph: "M4 6 L20 6 M4 12 L20 12 M4 18 L14 18 M16 16 L18 18 L20 16",
  },
  {
    id: "dtc-ecom",
    name: "DTC ecommerce",
    fitDefinition: "$5M–$50M Shopify-based with 3PL fulfillment.",
    sops: 32,
    automations: 16,
    flows: 11,
    promptPacks: 5,
    glyph: "M3 7 L21 7 L19 19 L5 19 Z M8 7 V4 H16 V7",
  },
  {
    id: "brokerage",
    name: "Real-estate brokerage",
    fitDefinition: "$50M–$500M GCI residential brokerages, 20–200 agents.",
    sops: 27,
    automations: 12,
    flows: 8,
    promptPacks: 4,
    glyph: "M4 11 L12 4 L20 11 V20 H4 Z M9 20 V13 H15 V20",
  },
  {
    id: "saas-support",
    name: "SaaS support",
    fitDefinition: "50–200 person SaaS support orgs with tier-2 escalation.",
    sops: 24,
    automations: 14,
    flows: 10,
    promptPacks: 5,
    glyph: "M4 8 H20 V18 L18 18 L16 20 L14 18 H4 Z M8 12 H16 M8 15 H13",
  },
  {
    id: "agency",
    name: "Marketing agencies",
    fitDefinition: "10–50 person digital agencies with retained services.",
    sops: 31,
    automations: 15,
    flows: 11,
    promptPacks: 5,
    glyph: "M4 4 H20 V20 H4 Z M4 9 H20 M9 4 V20",
  },
];
