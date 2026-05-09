import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link as WaspRouterLink } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../client/components/ui/card";
import { Badge } from "../client/components/ui/badge";

type VerticalData = {
  slug: string;
  name: string;
  fitDefinition: string | null;
  bundles: {
    slug: string;
    title: string;
    description: string | null;
    latestVersion: string | null;
    sopCount: number;
    automationCount: number;
    flowCount: number;
    promptPackCount: number;
  }[];
  sampleSops: {
    vertical: string;
    bundle: string;
    name: string;
    templateId: string;
    metadata: any;
  }[];
};

function kindBadge(label: string, count: number) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono text-[#181717] font-medium">{count}</span>
      <span className="text-[#575555]">{label}</span>
    </div>
  );
}

export function VerticalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VerticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No vertical specified");
      setLoading(false);
      return;
    }

    fetch(`/api/v1/catalog/verticals/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error.message);
        } else {
          setData(json.data);
        }
      })
      .catch((err: Error) => setError(err.message || "Failed to load vertical"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="text-[#575555]">Loading vertical details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-[#181717] text-3xl font-bold mb-4">Vertical Not Found</h1>
          <p className="text-[#575555]">{error || "This vertical does not exist."}</p>
          <Button asChild variant="outline" className="mt-6">
            <WaspRouterLink to="/">
              Back Home
            </WaspRouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="border-b border-[#D5D3D2] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-[#181717] font-semibold text-lg">
            VerticalPlaybook
          </a>
          <div className="flex items-center gap-4">
            <a href="/catalog" className="text-sm text-[#575555] hover:text-[#181717]">
              Catalog
            </a>
            <Button asChild size="sm">
              <a href="/#pricing">Buy Bundle</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Button asChild variant="ghost" className="mb-6">
          <WaspRouterLink to="/">
            ← Back Home
          </WaspRouterLink>
        </Button>

        {/* Vertical header */}
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-[#575555] font-mono mb-2">
            Vertical
          </p>
          <h1 className="text-[#181717] text-4xl font-bold">{data.name}</h1>
          {data.fitDefinition && (
            <p className="text-[#2E2D2D] text-lg mt-4 leading-relaxed max-w-2xl">
              {data.fitDefinition}
            </p>
          )}
        </div>

        {/* Bundles grid */}
        <h2 className="text-[#181717] text-2xl font-bold mb-6">
          Bundles ({data.bundles.length})
        </h2>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {data.bundles.map((bundle) => (
            <Card key={bundle.slug} className="border-[#D5D3D2] shadow-none hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{bundle.title}</CardTitle>
                {bundle.latestVersion && (
                  <CardDescription>Latest: v{bundle.latestVersion}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {bundle.description && (
                  <p className="text-[#575555] text-sm mb-4">{bundle.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {kindBadge("SOPs", bundle.sopCount)}
                  {kindBadge("Automations", bundle.automationCount)}
                  {kindBadge("n8n Flows", bundle.flowCount)}
                  {kindBadge("Prompt Packs", bundle.promptPackCount)}
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <WaspRouterLink to={`/catalog/${bundle.slug}` as any}>
                      View Details
                    </WaspRouterLink>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <WaspRouterLink to={`/sample-sop/${bundle.slug}` as any}>
                      Sample SOP
                    </WaspRouterLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample SOPs section */}
        {data.sampleSops.length > 0 && (
          <>
            <h2 className="text-[#181717] text-2xl font-bold mb-6">
              Sample SOPs
            </h2>

            <div className="grid gap-4 mb-12">
              {data.sampleSops.map((sop) => (
                <Card key={sop.templateId} className="border-[#D5D3D2] shadow-none">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#181717]">{sop.name}</p>
                      <p className="text-xs text-[#575555]">
                        From {sop.bundle} bundle
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <WaspRouterLink to={`/sample-sop/${sop.bundle}` as any}>
                        View Sample →
                      </WaspRouterLink>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="border border-[#D5D3D2] rounded-lg p-8 bg-[#F7F5F4] text-center">
          <h3 className="text-[#181717] text-xl font-bold mb-2">
            Ready to deploy?
          </h3>
          <p className="text-[#575555] text-sm mb-6 max-w-md mx-auto">
            Get the complete {data.name} playbook with all SOPs, automations,
            n8n flows, and prompt packs. Deploy in hours, not weeks.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild>
              <a href="/#pricing">View Pricing</a>
            </Button>
            <Button asChild variant="outline">
              <WaspRouterLink to="/catalog">
                Browse All Bundles
              </WaspRouterLink>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#D5D3D2] bg-[#F7F5F4] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-xs text-[#575555] font-mono">
          VerticalPlaybook / Prin7r 2026
        </div>
      </footer>
    </div>
  );
}
