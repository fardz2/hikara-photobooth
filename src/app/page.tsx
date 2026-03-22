import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { Nav } from "@/components/layout/nav";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { HeroSection } from "@/components/features/landing/hero-section";
import { Marquee } from "@/components/features/landing/marquee";
import { AboutSection } from "@/components/features/landing/about-section";
import { GallerySection } from "@/components/features/landing/gallery-section";
import { ThemesSection } from "@/components/features/landing/themes-section";
import { PackagesSection } from "@/components/features/landing/packages-section";
import { LocationSection } from "@/components/features/landing/location-section";
import { CtaSection } from "@/components/features/landing/cta-section";
import { AnchorSection } from "@/components/features/landing/anchor-section";
import { TestimonialSection } from "@/components/features/landing/testimonial-section";

export default function Home() {
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-[#F6F4F0] text-[#3A3532] font-sans selection:bg-[#8B5E56] selection:text-[#F6F4F0]">
        <CustomCursor />

        {/* Main Content wrapper with z-index floating above the footer */}
        <div className="relative z-10 bg-[#F6F4F0] mb-[500px] md:mb-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <NoiseOverlay />
          <Nav />

          <main>
            <HeroSection />
            <Marquee />
            <AboutSection />
            <GallerySection />
            <ThemesSection />
            <PackagesSection />
            <Marquee />
            <TestimonialSection />
            <LocationSection />
            <CtaSection />
            <AnchorSection />
          </main>
        </div>

        {/* Parallax Reveal Footer (Fixed under main content) */}
        <div className="fixed bottom-0 left-0 w-full h-[500px] md:h-[400px] z-0 pointer-events-none">
          <Footer />
        </div>
      </div>
    </LenisProvider>
  );
}
