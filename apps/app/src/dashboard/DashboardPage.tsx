import { Link as WaspRouterLink, routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Button } from "../client/components/ui/button";

export function DashboardPage({ user }: { user: User }) {
  return (
    <div className="mt-10 px-6">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-bold">
          Welcome, {user.username || user.email}
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage your VerticalPlaybook bundles.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No licenses yet. Browse the catalog to purchase your first
              playbook bundle.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <WaspRouterLink to={routes.CatalogRoute.to}>
                Browse Catalog
              </WaspRouterLink>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and profile.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <WaspRouterLink to={routes.AccountRoute.to}>
                Account Settings
              </WaspRouterLink>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Upload and manage your files in S3-compatible storage.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <WaspRouterLink to={routes.FileUploadRoute.to}>
                Manage Files
              </WaspRouterLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
