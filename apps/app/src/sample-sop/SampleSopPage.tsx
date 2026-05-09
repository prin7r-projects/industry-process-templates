import { useEffect, useState } from "react";
import { Link as WaspRouterLink } from "wasp/client/router";
import { useLocation } from "react-router";
import { Button } from "../client/components/ui/button";
import { Card, CardContent } from "../client/components/ui/card";
import { renderMarkdown } from "../client/utils/markdown";

type SampleSopData = {
  bundleSlug: string;
  bundleTitle: string;
  verticalName: string;
  verticalSlug: string;
  sopTitle: string;
  sopId: string;
  contentMd: string;
  sopCount: number;
  automationCount: number;
  n8nFlowCount: number;
  promptPackCount: number;
};

// Supported sample SOP slugs mapped to their bundle slugs
const SOP_SLUGS: Record<string, string> = {
  "hvac-fall-startup": "hvac-fall-startup",
  "marketing-agency-d1-30": "marketing-agency-d1-30",
  "accounting-year-end": "accounting-year-end",
};

export function SampleSopPage() {
  const [data, setData] = useState<SampleSopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Derive slug from the URL path
    const pathParts = location.pathname.split("/");
    const slug = pathParts[pathParts.length - 1];
    const bundleSlug = SOP_SLUGS[slug];

    if (!bundleSlug) {
      setError(`No sample SOP found for "${slug}"`);
      setLoading(false);
      return;
    }

    fetch(`/api/v1/catalog/bundles/${bundleSlug}/sample-sop`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error.message);
        } else {
          setData(json.data);
        }
      })
      .catch((err: Error) => setError(err.message || "Failed to load sample SOP"))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-[#575555]">Loading sample SOP...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-[#181717] text-3xl font-bold mb-4">Not Found</h1>
          <p className="text-[#575555]">{error || "Sample SOP not available"}</p>
          <Button asChild variant="outline" className="mt-6">
            <WaspRouterLink to="/catalog">
              Browse Catalog
            </WaspRouterLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top nav bar for sample-SOP pages (no Wasp auth nav) */}
      <header className="border-b border-[#D5D3D2] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Bundle context */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-[#575555] font-mono mb-2">
            Sample SOP — {data.verticalName}
          </p>
          <h1 className="text-[#181717] text-3xl font-bold">{data.sopTitle}</h1>
          <p className="text-[#575555] mt-2">
            From <strong>{data.bundleTitle}</strong> ({data.sopCount} SOPs,{" "}
            {data.automationCount} automations, {data.n8nFlowCount} n8n flows,{" "}
            {data.promptPackCount} prompt packs)
          </p>
        </div>

        {/* SOP Content */}
        <Card className="border-[#D5D3D2] shadow-none mb-8">
          <CardContent className="p-8 prose prose-sm max-w-none
            prose-headings:text-[#181717]
            prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-[#2E2D2D] prose-p:leading-relaxed
            prose-li:text-[#2E2D2D]
            prose-strong:text-[#181717]
            prose-code:text-[#D04841] prose-code:bg-[#F8E6E5] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-hr:border-[#D5D3D2]
            prose-table:border-collapse prose-th:border prose-th:border-[#D5D3D2] prose-th:px-3 prose-th:py-2 prose-th:bg-[#F7F5F4] prose-th:text-xs prose-th:font-medium
            prose-td:border prose-td:border-[#D5D3D2] prose-td:px-3 prose-td:py-2 prose-td:text-sm">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(data.contentMd) }} />
          </CardContent>
        </Card>

        {/* Sample disclaimer + CTA */}
        <div className="border border-[#D5D3D2] rounded-lg p-6 bg-[#F7F5F4] text-center">
          <p className="text-xs tracking-widest uppercase text-[#575555] font-mono mb-2">
            Sample
          </p>
          <p className="text-[#2E2D2D] text-sm mb-4">
            This is one of {data.sopCount} SOPs in the full <strong>{data.bundleTitle}</strong> bundle.
            Get the complete playbook with automations, n8n flows, and prompt packs.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild>
              <a href="/#pricing">Buy the Full Bundle — $249</a>
            </Button>
            <Button asChild variant="outline">
              <WaspRouterLink to={`/catalog/${data.bundleSlug}` as any}>
                View Bundle Details
              </WaspRouterLink>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D5D3D2] bg-[#F7F5F4] mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-xs text-[#575555] font-mono">
          VerticalPlaybook / Prin7r 2026 — Sample SOP
        </div>
      </footer>
    </div>
  );
}
