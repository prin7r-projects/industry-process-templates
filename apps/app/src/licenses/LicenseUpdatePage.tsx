import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { getUserLicenseById } from "wasp/client/operations";
import type { User } from "wasp/entities";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../client/components/ui/card";
import { Badge } from "../client/components/ui/badge";

type TemplateItem = {
  id: string;
  kind: string;
  title: string;
};

type LicenseDetail = {
  id: string;
  licenseKey: string;
  licenseKind: string;
  status: string;
  downloadedAt: string | null;
  downloadTokenExpiresAt: string | null;
  bundleVersion: {
    id: string;
    semver: string;
    publishedAt: string;
    artifactSize: number;
    bundle: {
      slug: string;
      title: string;
      description: string | null;
      verticalSlug: string;
    };
    templates: TemplateItem[];
  };
  latestVersion: {
    id: string;
    semver: string;
    publishedAt: string;
    artifactSize: number;
    templates: TemplateItem[];
  } | null;
};

function kindLabel(kind: string): string {
  switch (kind) {
    case "sop": return "SOP";
    case "automation": return "Automation";
    case "n8n_flow": return "n8n Flow";
    case "prompt_pack": return "Prompt Pack";
    default: return kind;
  }
}

function kindBadge(kind: string) {
  const colors: Record<string, string> = {
    sop: "border-blue-300 bg-blue-50 text-blue-700",
    automation: "border-green-300 bg-green-50 text-green-700",
    n8n_flow: "border-purple-300 bg-purple-50 text-purple-700",
    prompt_pack: "border-amber-300 bg-amber-50 text-amber-700",
  };
  return (
    <Badge variant="outline" className={colors[kind] || "border-gray-300"}>
      {kindLabel(kind)}
    </Badge>
  );
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LicenseUpdatePage({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Local state: set of template IDs marked "merged"
  const [merged, setMerged] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) {
      setError("No license ID provided");
      setLoading(false);
      return;
    }
    getUserLicenseById({ licenseId: id })
      .then((data: LicenseDetail | null) => setLicense(data))
      .catch((err: Error) => setError(err.message || "Failed to load license"))
      .finally(() => setLoading(false));
  }, [id]);

  const diff = useMemo(() => {
    if (!license?.latestVersion || !license?.bundleVersion) return null;

    const currentIds = new Set(license.bundleVersion.templates.map((t) => t.id));
    const latestIds = new Set(license.latestVersion.templates.map((t) => t.id));

    const added = license.latestVersion.templates.filter((t) => !currentIds.has(t.id));
    const removed = license.bundleVersion.templates.filter((t) => !latestIds.has(t.id));
    const unchanged = license.bundleVersion.templates.filter((t) => latestIds.has(t.id));

    const currentSemver = license.bundleVersion.semver;
    const latestSemver = license.latestVersion.semver;
    const isUpToDate = currentSemver === latestSemver;

    return { added, removed, unchanged, currentSemver, latestSemver, isUpToDate };
  }, [license]);

  const toggleMerged = (templateId: string) => {
    setMerged((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="mt-10 px-6">
        <p className="text-muted-foreground">Loading license details...</p>
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="mt-10 px-6">
        <h1 className="text-foreground text-3xl font-bold mb-4">License Not Found</h1>
        <p className="text-muted-foreground">{error || "This license does not exist or you don't have access."}</p>
        <Button asChild variant="outline" className="mt-4">
          <WaspRouterLink to={routes.LicensesRoute.to}>
            Back to Licenses
          </WaspRouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 px-6">
      <Button asChild variant="ghost" className="mb-4">
        <WaspRouterLink to={routes.LicensesRoute.to}>
          ← Back to Licenses
        </WaspRouterLink>
      </Button>

      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold">
          {license.bundleVersion.bundle.title}
        </h1>
        <p className="text-muted-foreground mt-2">
          Bundle update status for license {license.licenseKey.slice(0, 8)}...
        </p>
      </div>

      {/* Version comparison */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Version</CardTitle>
            <CardDescription>
              Downloaded {license.downloadedAt ? formatDate(license.downloadedAt) : "not yet downloaded"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">v{license.bundleVersion.semver}</p>
            <p className="text-muted-foreground text-sm mt-1">
              Published {formatDate(license.bundleVersion.publishedAt)}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {license.bundleVersion.templates.length} templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Available</CardTitle>
            <CardDescription>
              {diff?.isUpToDate ? "You're up to date" : "A newer version is available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold font-mono ${diff?.isUpToDate ? "text-green-700" : ""}`}>
              v{license.latestVersion?.semver || "—"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Published {license.latestVersion ? formatDate(license.latestVersion.publishedAt) : "—"}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {license.latestVersion?.templates.length || 0} templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diff details */}
      {diff && !diff.isUpToDate && (
        <>
          <h2 className="text-foreground text-xl font-bold mb-4">Changes</h2>

          {diff.added.length > 0 && (
            <Card className="mb-4 border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-base text-green-700">
                  +{diff.added.length} New Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {diff.added.map((t) => (
                    <li key={t.id} className="flex items-start gap-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={merged.has(t.id)}
                          onChange={() => toggleMerged(t.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            {kindBadge(t.kind)}
                            <span className="text-sm font-medium">{t.title}</span>
                          </div>
                          {merged.has(t.id) && (
                            <span className="text-xs text-green-700 mt-1 block">Merged (local)</span>
                          )}
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {diff.removed.length > 0 && (
            <Card className="mb-4 border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-base text-red-700">
                  −{diff.removed.length} Removed Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diff.removed.map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      {kindBadge(t.kind)}
                      <span className="text-sm line-through text-muted-foreground">{t.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {diff.unchanged.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">
                  {diff.unchanged.length} Unchanged Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {diff.unchanged.length} templates remain the same between v{diff.currentSemver} and v{diff.latestSemver}.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Merge progress */}
          <div className="mt-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Merge progress: {merged.size}/{diff.added.length + diff.removed.length} changes reviewed
              {merged.size === diff.added.length + diff.removed.length && (
                <span className="text-green-700 ml-2">✓ All changes reviewed</span>
              )}
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${diff.added.length + diff.removed.length > 0 ? (merged.size / (diff.added.length + diff.removed.length)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </>
      )}

      {diff?.isUpToDate && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-green-700 font-medium">✓ You have the latest version</p>
            <p className="text-muted-foreground text-sm mt-2">
              Your bundle is at v{license.bundleVersion.semver}, which matches the latest published version.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
