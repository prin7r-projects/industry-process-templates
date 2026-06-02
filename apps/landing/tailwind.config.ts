import type { Config } from "tailwindcss";

/*
 * VerticalPlaybook — Wave 2 design refresh 2026-05-08
 * Wave 2 design fix 2026-06-02: warm-pink/beige wash removed from
 * supporting tokens (`paper`, `paper-2` go cool-neutral / pure white;
 * `cinnabar-wash` becomes a neutral alert surface). Cinnabar/Action
 * Red is demoted to a documented micro-accent only — primary CTAs now
 * use ink/black fill. Token NAMES preserved (paper/paper-2/ink/
 * graphite/rule/cinnabar/ochre/success) so existing components keep
 * rendering; only VALUES and intended roles changed.
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
        paper: "#FFFFFF",          // page canvas (pure white, no warm tint)
        "paper-2": "#F4F4F3",      // surface frost (cool neutral)
        ink: "#0F0F0F",            // graphite black — primary CTA fill
        graphite: "#2A2A2A",       // storm gray — secondary body + CTA hover
        "graphite-2": "#5B5B5B",   // stone gray
        rule: "#D5D3D2",           // cloud mist (1px borders)
        "rule-2": "#E8E5E3",
        cinnabar: "#D04841",       // action red — micro-accent only
        "cinnabar-deep": "#A03A33",
        "cinnabar-wash": "#F1F1F0", // neutral alert wash (was warm pink)
        ochre: "#5A82DE",          // action blue — secondary highlight (kept for hero blueprint)
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
