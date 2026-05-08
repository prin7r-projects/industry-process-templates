"use client";

import { useState } from "react";
import { tiers, type Tier } from "@/lib/tiers";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type CheckoutState = {
  loading: boolean;
  error?: string;
};

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
      };
      if (data.ok && data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setState((prev) => ({
        ...prev,
        [tier.id]: {
          loading: false,
          error: data.message ?? "Checkout couldn't start. Please try again or email hello@verticalplaybook.",
        },
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        [tier.id]: {
          loading: false,
          error: "Network error reaching checkout. Please try again.",
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
                    <span className="text-cinnabar font-mono mt-0.5" aria-hidden="true">+</span>
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
                  <p className="text-caption text-cinnabar bg-cinnabar-wash border border-cinnabar/30 rounded p-3" role="alert">
                    {s.error}
                  </p>
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
