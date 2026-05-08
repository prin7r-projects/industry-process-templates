import type { Metadata } from "next";
import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://industry-process-templates.prin7r.com"),
  title: "Plumbline — vertical-specific operational bundles",
  description:
    "The operational system you wish came in the box. SOPs, automations, n8n flows, and prompt packs — calibrated for HVAC, dental, accounting, DTC ecommerce, brokerage, SaaS support, and marketing-agency operators. Drops into your stack inside a day.",
  keywords: [
    "operational templates",
    "industry process templates",
    "SOPs",
    "n8n workflows",
    "vertical operations",
    "COO toolkit",
    "agency operating system",
  ],
  openGraph: {
    title: "Plumbline — operational bundles, calibrated by vertical",
    description:
      "Pick your vertical. Get 24-32 SOPs, 12-16 automations, 9 n8n flows, and 3-5 prompt packs — calibrated for your industry's real operators. You'll be running it by Friday.",
    type: "website",
    url: "https://industry-process-templates.prin7r.com",
    siteName: "Plumbline",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plumbline — operational bundles, calibrated by vertical",
    description:
      "Vertical-specific operational bundles for HVAC, dental, accounting, DTC, brokerage, SaaS support, and marketing agencies. Drops into your stack inside a day.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;utf8,%3Csvg viewBox=%270 0 32 32%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Crect width=%2732%27 height=%2732%27 fill=%27%23FAFAF8%27/%3E%3Cline x1=%2716%27 y1=%274%27 x2=%2716%27 y2=%2722%27 stroke=%27%231A1A18%27 stroke-width=%271.5%27/%3E%3Ccircle cx=%2716%27 cy=%2725%27 r=%274%27 fill=%27%23C8472B%27/%3E%3C/svg%3E"
        />
      </head>
      <body className="bg-paper text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
