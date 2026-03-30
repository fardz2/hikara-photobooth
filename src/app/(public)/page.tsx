import { Suspense } from "react";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { Nav } from "@/components/layout/nav";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Footer } from "@/components/layout/footer";
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
    <>
      <Nav />
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
    </>
  );
}
