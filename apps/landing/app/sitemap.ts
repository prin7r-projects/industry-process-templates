import type { MetadataRoute } from "next";

// VerticalPlaybook marketing site. The landing is a single page composed of
// in-section anchors (Verticals, Bundle anatomy, Pricing, FAQ), plus a small
// set of real standalone routes (Contact, Legal). The base URL matches the
// `metadataBase` in app/layout.tsx and the Sitemap reference already advertised
// in public/robots.txt (https://industry-process-templates.prin7r.com/sitemap.xml).
const BASE_URL = "https://industry-process-templates.prin7r.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // In-page anchors that double as the landing's "key sections" — kept in sync
  // with the nav in components/SiteHeader.tsx and the section ids in page.tsx.
  const sections = ["verticals", "anatomy", "pricing", "faq"] as const;

  // Real standalone routes under app/.
  const pages: Array<{ path: string; priority: number }> = [
    { path: "/contact", priority: 0.5 },
    { path: "/legal/privacy", priority: 0.3 },
    { path: "/legal/license", priority: 0.3 },
  ];

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sections.map((section) => ({
      url: `${BASE_URL}/#${section}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...pages.map(({ path, priority }) => ({
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
    })),
  ];
}
