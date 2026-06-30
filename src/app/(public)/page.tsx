import { getSiteContent, getPricing } from "@/lib/services/site-content-service";
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
import { Suspense } from "react";
async function HomeContent() {
  const [heroData, aboutData, galleryData, themesData, testimonialsData, locationData, ctaData, pricing] =
    await Promise.all([
      getSiteContent("hero"),
      getSiteContent("about"),
      getSiteContent("gallery"),
      getSiteContent("themes"),
      getSiteContent("testimonials"),
      getSiteContent("location"),
      getSiteContent("cta"),
      getPricing(),
    ]);

  const marqueeText = ["HIKARA", "PHOTOBOX", "STUDIO QUALITY", "MEMORIES"];
  const galleryImages = (galleryData?.images as string[]) || [];
  const themesItems = (themesData?.items as any[]) || [];
  const testimonialItems = (testimonialsData?.items as any[]) || [];

  return (
    <>
      <HeroSection data={heroData} />
      <Marquee text={marqueeText} />
      <AboutSection data={aboutData} />
      <GallerySection images={galleryImages} />
      <ThemesSection items={themesItems} />
      <PackagesSection pricing={pricing} />
      <Marquee text={marqueeText} />
      <TestimonialSection items={testimonialItems} />
      <LocationSection data={locationData} />
      <CtaSection data={ctaData} />
      <AnchorSection />
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
