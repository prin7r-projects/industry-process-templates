import { useEffect, useState, useCallback } from "react";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { getUserLicenses } from "wasp/client/operations";
import type { User } from "wasp/entities";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Badge } from "../client/components/ui/badge";

// Type for a license row returned from getUserLicenses
// Dates are serialized as strings by Wasp HTTP layer.
type LicenseRow = {
  id: string;
  createdAt: string;
  licenseKey: string;
  licenseKind: string;
  status: string;
  expiresAt: string | null;
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
      sopCount: number;
      automationCount: number;
      n8nFlowCount: number;
      promptPackCount: number;
      verticalSlug: string;
    };
  };
  order: {
    id: string;
    tier: string;
    amountUsd: string | number | null;
    status: string;
    paidAt: string | null;
  } | null;
};

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function tierLabel(tier: string): string {
  switch (tier) {
    case "single_bundle": return "Single Bundle";
    case "vertical_pack": return "Vertical Pack";
    case "enterprise": return "Enterprise";
    default: return tier;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Active</Badge>;
    case "revoked":
      return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">Revoked</Badge>;
    case "expired":
      return <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function LicensesPage({ user }: { user: User }) {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{ id: string; msg: string; kind: "success" | "error" } | null>(null);

  useEffect(() => {
    getUserLicenses()
      .then((data) => setLicenses(data as unknown as LicenseRow[]))
      .catch((err: Error) => setError(err.message || "Failed to load licenses"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = useCallback(async (licenseId: string) => {
    setDownloadingId(licenseId);
    setDownloadMessage(null);
    try {
      const res = await fetch("/api/v1/delivery/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId }),
      });
      const json = await res.json();
      if (json.error) {
        setDownloadMessage({ id: licenseId, msg: json.error.message, kind: "error" });
        return;
      }
      // Trigger download
      const dlUrl = json.data.downloadUrl;
      window.open(dlUrl, "_blank");
      setDownloadMessage({ id: licenseId, msg: "Download started", kind: "success" });
    } catch (err: any) {
      setDownloadMessage({ id: licenseId, msg: err.message || "Download failed", kind: "error" });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="mt-10 px-6">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Your Licenses</h1>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 px-6">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">Your Licenses</h1>
        </div>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-foreground text-2xl sm:text-3xl font-bold">Your Licenses</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your purchased bundles and download your playbooks.
        </p>
      </div>

      {licenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              You don't have any licenses yet. Browse the catalog to purchase your first playbook bundle.
            </p>
            <Button asChild variant="outline">
              <WaspRouterLink to={routes.CatalogRoute.to}>
                Browse Catalog
              </WaspRouterLink>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {licenses.map((license) => (
            <Card key={license.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {license.bundleVersion.bundle.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">
                      Version {license.bundleVersion.semver} —{" "}
                      {license.bundleVersion.bundle.verticalSlug.toUpperCase()} vertical
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(license.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tier</span>
                    <p className="font-medium">{license.order ? tierLabel(license.order.tier) : "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued</span>
                    <p className="font-medium">{formatDate(license.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Downloaded</span>
                    <p className="font-medium">{license.downloadedAt ? formatDate(license.downloadedAt) : "Never"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size</span>
                    <p className="font-medium">{formatBytes(license.bundleVersion.artifactSize)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4 text-xs text-muted-foreground">
                  <div>{license.bundleVersion.bundle.sopCount} SOPs</div>
                  <div>{license.bundleVersion.bundle.automationCount} Automations</div>
                  <div>{license.bundleVersion.bundle.n8nFlowCount} n8n Flows</div>
                  <div>{license.bundleVersion.bundle.promptPackCount} Prompts</div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {license.status === "active" && (
                    <Button
                      onClick={() => handleDownload(license.id)}
                      disabled={downloadingId === license.id}
                      size="sm"
                    >
                      {downloadingId === license.id ? "Minting..." : "Download Bundle"}
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <WaspRouterLink
                      to={`/app/licenses/${license.id}/updates` as any}
                    >
                      Check for Updates
                    </WaspRouterLink>
                  </Button>
                </div>

                {downloadMessage && downloadMessage.id === license.id && (
                  <p
                    className={`mt-2 text-sm ${
                      downloadMessage.kind === "error" ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {downloadMessage.msg}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
