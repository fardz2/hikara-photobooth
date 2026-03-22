import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { HeroSection } from "@/components/features/landing/hero-section";
import { Marquee } from "@/components/features/landing/marquee";
import { AboutSection } from "@/components/features/landing/about-section";
import { GallerySection } from "@/components/features/landing/gallery-section";
import { PackagesSection } from "@/components/features/landing/packages-section";
import { LocationSection } from "@/components/features/landing/location-section";
import { CtaSection } from "@/components/features/landing/cta-section";
import { AnchorSection } from "@/components/features/landing/anchor-section";

export default function Home() {
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-[#F6F4F0] text-[#3A3532] font-sans selection:bg-[#8B5E56] selection:text-[#F6F4F0] overflow-x-hidden">
        <NoiseOverlay />
        <Nav />

        <main>
          <HeroSection />
          <Marquee />
          <AboutSection />
          <GallerySection />
          <PackagesSection />
          <Marquee />
          <LocationSection />
          <CtaSection />
          <AnchorSection />
        </main>

        <Footer />
      </div>
    </LenisProvider>
  );
}
