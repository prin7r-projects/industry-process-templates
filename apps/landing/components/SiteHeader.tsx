"use client";

import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-sm border-b border-rule">
      <div className="container-page flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="VerticalPlaybook home"
        >
          <Wordmark size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-graphite" aria-label="Primary">
          <a href="#verticals" className="hover:text-ink transition-colors">Verticals</a>
          <a href="#anatomy" className="hover:text-ink transition-colors">What's in a bundle</a>
          <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
        </nav>

        <Button
          variant="primary"
          size="sm"
          asChild
        >
          <a href="#pricing">Buy a bundle</a>
        </Button>
      </div>
    </header>
  );
}
