import type { Config } from "tailwindcss";

/*
 * Plumbline — Wave 2 design refresh 2026-05-08
 * Reference: tailscale (Cloud control panel on pristine paper)
 * Token NAMES preserved (paper/paper-2/ink/graphite/rule/cinnabar/ochre/success)
 * so existing components (BlueprintHero / VerticalGrid / BundleAnatomy /
 * Pricing / FAQ / SiteHeader / SiteFooter / Wordmark) keep rendering
 * unchanged. Only VALUES are remapped from the v1 paper-and-cinnabar
 * palette → tailscale's Cloud Control Panel palette: Action Red `#D04841`
 * accent, Graphite Black ink, Storm/Stone/Smoke grays, Cloud Mist rules.
 * Page canvas kept at milky `#FAFAF8` instead of the reference's warmer
 * Canvas Pale `#EEEBEA` per user's no-beige rule.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF8",          // page canvas (no beige)
        "paper-2": "#F7F5F4",      // surface frost
        ink: "#181717",            // graphite black
        graphite: "#2E2D2D",       // storm gray
        "graphite-2": "#575555",   // stone gray
        rule: "#D5D3D2",           // cloud mist (1px borders)
        "rule-2": "#E8E5E3",
        cinnabar: "#D04841",       // action red — primary accent
        "cinnabar-deep": "#A03A33",
        "cinnabar-wash": "#F8E6E5",
        ochre: "#5A82DE",          // action blue gradient start (secondary highlight)
        success: "#2D7A4F",
      },
      fontFamily: {
        // Tailscale uses Inter throughout; we keep Source Serif 4 token
        // available for any component that still references font-serif,
        // but the design refresh pushes Inter for headings (sans-throughout
        // direction with tighter tracking).
        serif: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        plate: ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        caption: ["12px", { lineHeight: "1.5", letterSpacing: "-0.36px" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "-0.48px" }],
        lead: ["20px", { lineHeight: "1.5", letterSpacing: "-0.6px" }],
        h4: ["22px", { lineHeight: "1.3", letterSpacing: "-0.66px" }],
        h3: ["28px", { lineHeight: "1.25", letterSpacing: "-0.84px" }],
        h2: ["36px", { lineHeight: "1.2", letterSpacing: "-1.08px" }],
        h1: ["48px", { lineHeight: "1.2", letterSpacing: "-1.44px" }],
        display: ["64px", { lineHeight: "1.2", letterSpacing: "-1.92px" }],
      },
      borderRadius: {
        sharp: "0px",
        DEFAULT: "8px",      // tailscale buttons
        card: "16px",        // tailscale cards
        "card-lg": "32px",   // tailscale large feature cards
        pill: "9999px",      // tailscale tags
      },
      boxShadow: {
        plate: "rgba(24, 23, 23, 0.02) 0px 4px 8px 0px",
        hover: "rgba(24, 23, 23, 0.16) 0px 4px 16px 0px",
      },
      maxWidth: {
        container: "1200px",
        "container-wide": "1320px",
      },
    },
  },
  plugins: [],
};

export default config;
