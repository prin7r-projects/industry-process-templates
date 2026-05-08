# `apps/app/` — open-saas fork stub (Wave 3)

This folder is a placeholder for the upcoming SaaS app that will sit behind the VerticalPlaybook storefront and own:

- Buyer authentication (Wasp default — magic-link or password)
- Bundle download tokens (signed URLs against object storage)
- Customer dashboard (purchased bundles, update history, license keys)
- Refund tooling (admin-side stablecoin reversal)
- Quarterly bundle update notifications

## Plan

We will fork [`wasp-lang/open-saas`](https://github.com/wasp-lang/open-saas) into this directory, keeping its Wasp app structure intact. Then:

1. Strip default email/Stripe billing — VerticalPlaybook uses NOWPayments.
2. Wire NOWPayments webhook → Wasp action that creates a `License` record and emits a download token.
3. Build the bundle catalog model (`Vertical` 1:N `Bundle` 1:N `BundleVersion`).
4. Deploy alongside the landing on `storage-contabo` under a separate subdomain (e.g. `app.industry-process-templates.prin7r.com`) — or combined under a single Next.js app, decision to be made at Wave 3 kickoff.

## Why we're not building it in Wave 2

Wave 2 ships the marketing surface and the *transaction* (buyer can create a real NOWPayments hosted invoice and pay). Bundle delivery, license keys, and customer dashboard are all Wave 3 deliverables because:

- They require Postgres + object storage provisioning (not yet stood up).
- They depend on first-bundle authoring (HVAC v1.0 is the unit of value to deliver).
- They benefit from real-traffic feedback from Wave 2 — buyers' first questions inform the dashboard's information architecture.

## Don't run this folder yet

There's nothing to run. The folder exists to anchor the monorepo shape.
