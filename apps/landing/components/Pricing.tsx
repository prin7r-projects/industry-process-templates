"use client";

import { useState } from "react";
import { tiers, type Tier } from "@/lib/tiers";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type CheckoutState = {
  loading: boolean;
  error?: string;
  // PRI-3730: when checkout is not configured on the deployed env we
  // surface a "contact us" mailto fallback so live buyers can still
  // complete the purchase. We never route them through a simulated
  // checkout flow.
  contactFallback?: boolean;
};

// PRI-3730: the address operators send buyers to when checkout is
// temporarily unavailable. Mirrored in the footer Contact column so
// there is a single canonical inbox for the landing.
const CONTACT_EMAIL = "hello@verticalplaybook.com";

function contactMailto(tier: Tier): string {
  const subject = `VerticalPlaybook ${tier.name} — manual checkout request`;
  const body = `Hi VerticalPlaybook team,\n\nI'd like to buy the ${tier.name} (${tier.priceLabel}) but the online checkout returned an error. Please send a manual invoice.\n\nThanks,`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Pricing() {
  const [state, setState] = useState<Record<Tier["id"], CheckoutState>>({
    single: { loading: false },
    "vertical-pack": { loading: false },
    enterprise: { loading: false },
  });

  async function startCheckout(tier: Tier) {
    setState((prev) => ({ ...prev, [tier.id]: { loading: true } }));
    try {
      const response = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        checkoutUrl?: string;
        message?: string;
        error?: string;
      };

      // PRI-3730: only redirect to a checkoutUrl when the server tells
      // us ok=true AND the URL is on the NOWPayments hosted-invoice
      // origin. The server already enforces this — this is a defence
      // in depth on the client so a buyer can never be sent to a
      // /checkout/simulated URL.
      const isLiveCheckoutUrl =
        typeof data.checkoutUrl === "string" &&
        /^https:\/\/(sandbox\.)?nowpayments\.io\//.test(data.checkoutUrl);

      if (data.ok && isLiveCheckoutUrl && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      const isConfigError = data.error === "configuration" || response.status === 503;
      setState((prev) => ({
        ...prev,
        [tier.id]: {
          loading: false,
          contactFallback: isConfigError,
          error:
            data.message ??
            `Checkout couldn't start. Please email ${CONTACT_EMAIL} or try again in a moment.`,
        },
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        [tier.id]: {
          loading: false,
          error: `Network error reaching checkout. Please email ${CONTACT_EMAIL} or try again.`,
        },
      }));
    }
  }

  return (
    <section
      id="pricing"
      className="container-page section-rhythm border-t border-rule"
      aria-labelledby="pricing-heading"
    >
      <header className="max-w-[700px] mb-14 md:mb-16">
        <p className="plate-caption mb-4">PLATE 05 — PRICING</p>
        <h2
          id="pricing-heading"
          className="font-serif text-h2 lg:text-[48px] text-ink mb-4 leading-[1.1] tracking-[-0.015em]"
        >
          Buy the bundle. Be running by Friday.
        </h2>
        <p className="text-lead text-graphite max-w-[55ch]">
          Three tiers. Crypto checkout via NOWPayments — USDT, USDC, or card on-ramp. 30-day no-questions refund.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {tiers.map((tier) => {
          const s = state[tier.id];
          const recommended = tier.recommended;
          return (
            <div
              key={tier.id}
              // Wave 2 design fix 2026-06-02: "Recommended" tier keeps
              // a 2px cinnabar (micro-accent) border + ribbon to honor
              // the documented micro-accent rule. The CTA fill is
              // ink/black (see ui/button.tsx), not cinnabar.
              className={cn(
                "relative bg-paper rounded-card p-7 lg:p-8 flex flex-col",
                recommended ? "border-2 border-cinnabar md:scale-[1.02] shadow-plate" : "border border-rule",
              )}
            >
              {recommended && (
                <span
                  className="absolute -top-3 right-6 bg-cinnabar text-paper plate-caption px-3 py-1 rounded-sm"
                  aria-label="Recommended tier"
                >
                  RECOMMENDED
                </span>
              )}

              <div className="mb-6">
                <p className="plate-caption mb-2">TIER 0{tiers.indexOf(tier) + 1}</p>
                <h3 className="font-serif text-h3 text-ink mb-3">{tier.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-serif text-[44px] leading-none text-ink tracking-tight">
                    {tier.priceLabel}
                  </span>
                  <span className="text-caption text-graphite-2">USD</span>
                </div>
                <p className="text-caption text-graphite max-w-[36ch]">{tier.trail}</p>
              </div>

              <ul className="space-y-2.5 mb-7 border-t border-rule pt-5">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-caption text-graphite leading-snug">
                    <span className="text-ink font-mono mt-0.5" aria-hidden="true">+</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto space-y-3">
                <Button
                  variant={recommended ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => startCheckout(tier)}
                  disabled={s.loading}
                  aria-label={`${tier.ctaLabel} — ${tier.priceLabel} via NOWPayments`}
                >
                  {s.loading ? "Opening NOWPayments…" : `${tier.ctaLabel} · ${tier.priceLabel}`}
                </Button>
                <p className="text-[11px] text-graphite-2 text-center font-mono tracking-tight">
                  USDT / USDC + card on-ramp via NOWPayments
                </p>
                {s.error && (
                  <div
                    className="text-caption text-cinnabar bg-cinnabar-wash border border-cinnabar/30 rounded p-3 space-y-2"
                    role="alert"
                  >
                    <p>{s.error}</p>
                    {s.contactFallback && (
                      <p>
                        <a
                          href={contactMailto(tier)}
                          className="underline font-medium text-ink hover:text-cinnabar"
                        >
                          Email {CONTACT_EMAIL} →
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <ProofPoint title="30-day refund" body="No-questions refund processed as a stablecoin reversal to your wallet within 5 business days." />
        <ProofPoint title="Quarterly updates" body="When ServiceTitan or QuickBooks ships an API change, your bundle gets a v2.1 inside a month." />
        <ProofPoint title="Single-implementation license" body="Use freely within your business. Resale and redistribution prohibited." />
      </div>
    </section>
  );
}

function ProofPoint({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-ink pt-4">
      <p className="plate-caption mb-1.5 text-ink">{title}</p>
      <p className="text-caption text-graphite leading-snug">{body}</p>
    </div>
  );
}
