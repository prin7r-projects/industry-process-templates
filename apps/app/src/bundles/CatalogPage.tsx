import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";

const bundles = [
  {
    slug: "hvac-fall-startup",
    name: "HVAC Fall Startup",
    vertical: "HVAC",
    description:
      "Complete fall-season startup playbook for HVAC contractors. 28 SOPs, 14 automations, 9 n8n flows, 4 prompt packs.",
    sops: 28,
    automations: 14,
    flows: 9,
    prompts: 4,
  },
  {
    slug: "marketing-agency-d1-30",
    name: "Marketing Agency D1-30 Onboarding",
    vertical: "Marketing Agency",
    description:
      "First 30 days client onboarding system for marketing agencies. 22 SOPs, 12 automations, 7 n8n flows, 3 prompt packs.",
    sops: 22,
    automations: 12,
    flows: 7,
    prompts: 3,
  },
  {
    slug: "accounting-year-end",
    name: "Accounting Year-End Cadence",
    vertical: "Accounting",
    description:
      "Year-end close and compliance cadence for accounting firms. 19 SOPs, 8 automations, 5 n8n flows, 5 prompt packs.",
    sops: 19,
    automations: 8,
    flows: 5,
    prompts: 5,
  },
];

export function CatalogPage() {
  return (
    <div className="mt-10 px-6">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold">Bundle Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Industry-specific process playbooks ready to deploy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <Card key={bundle.slug}>
            <CardHeader>
              <CardTitle className="text-lg">{bundle.name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {bundle.vertical}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {bundle.description}
              </p>
              <div className="text-muted-foreground text-xs space-y-1 mb-4">
                <div>{bundle.sops} SOPs</div>
                <div>{bundle.automations} Automations</div>
                <div>{bundle.flows} n8n Flows</div>
                <div>{bundle.prompts} Prompt Packs</div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <WaspRouterLink
                  to={("/catalog/" + bundle.slug) as typeof routes.BundleDetailRoute.to}
                >
                  View Details
                </WaspRouterLink>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
