import { useParams } from "react-router";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";

const bundleData: Record<
  string,
  {
    name: string;
    vertical: string;
    description: string;
    sops: number;
    automations: number;
    flows: number;
    prompts: number;
  }
> = {
  "hvac-fall-startup": {
    name: "HVAC Fall Startup",
    vertical: "HVAC",
    description:
      "Complete fall-season startup playbook for HVAC contractors covering equipment inspection, scheduling, customer communication, and seasonal maintenance workflows.",
    sops: 28,
    automations: 14,
    flows: 9,
    prompts: 4,
  },
  "marketing-agency-d1-30": {
    name: "Marketing Agency D1-30 Onboarding",
    vertical: "Marketing Agency",
    description:
      "First 30 days client onboarding system covering discovery, strategy, asset collection, campaign setup, reporting cadence, and QBR prep.",
    sops: 22,
    automations: 12,
    flows: 7,
    prompts: 3,
  },
  "accounting-year-end": {
    name: "Accounting Year-End Cadence",
    vertical: "Accounting",
    description:
      "Year-end close and compliance cadence covering trial balance review, adjusting entries, tax prep handoff, and client deliverable packaging.",
    sops: 19,
    automations: 8,
    flows: 5,
    prompts: 5,
  },
};

export function BundleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const bundle = slug ? bundleData[slug] : undefined;

  if (!bundle) {
    return (
      <div className="mt-10 px-6 text-center">
        <h1 className="text-foreground text-2xl font-bold">Bundle Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The bundle "{slug}" does not exist.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <WaspRouterLink to={routes.CatalogRoute.to}>
            Back to Catalog
          </WaspRouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 px-6">
      <Button asChild variant="ghost" className="mb-4">
        <WaspRouterLink to={routes.CatalogRoute.to}>
          ← Back to Catalog
        </WaspRouterLink>
      </Button>

      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold">{bundle.name}</h1>
        <p className="text-muted-foreground mt-2">{bundle.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{bundle.sops}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">SOPs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{bundle.automations}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{bundle.flows}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">n8n Flows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{bundle.prompts}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Prompt Packs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Full bundle contents are available after purchase. Browse the sample
            SOP on the landing page to preview the quality.
          </p>
          <Button className="mt-4" disabled>
            Purchase — Coming in Phase 3
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
