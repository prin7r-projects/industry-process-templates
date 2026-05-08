import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF8",
        "paper-2": "#F2F1EC",
        ink: "#1A1A18",
        graphite: "#444441",
        "graphite-2": "#7A7975",
        rule: "#D7D5CD",
        "rule-2": "#E6E4DC",
        cinnabar: "#C8472B",
        "cinnabar-deep": "#A53618",
        "cinnabar-wash": "#F6E4DD",
        ochre: "#B98B2E",
        success: "#3B7A4C",
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        plate: ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        caption: ["12px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        body: ["16px", { lineHeight: "1.6", letterSpacing: "0" }],
        lead: ["19px", { lineHeight: "1.55", letterSpacing: "0" }],
        h4: ["22px", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        h3: ["28px", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        h2: ["36px", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        h1: ["56px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        display: ["80px", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        sharp: "0px",
        DEFAULT: "4px",
        card: "6px",
      },
      boxShadow: {
        plate:
          "0 1px 0 rgba(26, 26, 24, 0.04), 0 0 0 1px rgba(26, 26, 24, 0.06)",
        hover:
          "0 4px 20px -8px rgba(26, 26, 24, 0.08), 0 0 0 1px rgba(26, 26, 24, 0.12)",
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
