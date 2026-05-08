import { Link as WaspRouterLink, routes } from "wasp/client/router";

export function EmailLinkPage() {
  return (
    <div className="mt-10 px-6 text-center">
      <h1 className="text-foreground text-2xl font-bold">Check Your Email</h1>
      <p className="text-muted-foreground mt-2">
        We sent a magic link to your email address. Click the link to sign in.
      </p>
      <p className="text-muted-foreground mt-4 text-sm">
        Didn't receive an email?{" "}
        <WaspRouterLink
          to={routes.LoginRoute.to}
          className="text-primary hover:underline"
        >
          Try again
        </WaspRouterLink>
      </p>
    </div>
  );
}
