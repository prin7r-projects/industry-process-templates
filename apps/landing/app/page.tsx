import { SiteHeader } from "@/components/SiteHeader";
import { BlueprintHero } from "@/components/BlueprintHero";
import { VerticalGrid } from "@/components/VerticalGrid";
import { BundleAnatomy } from "@/components/BundleAnatomy";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <BlueprintHero />
        <VerticalGrid />
        <BundleAnatomy />
        <Pricing />
        <FAQ />
      </main>
      <SiteFooter />
    </>
  );
}
