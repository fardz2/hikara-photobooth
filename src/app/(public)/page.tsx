import { Suspense } from "react";
import { AboutSection } from "@/components/features/landing/about-section";
import { AnchorSection } from "@/components/features/landing/anchor-section";
import { CtaSection } from "@/components/features/landing/cta-section";
import { GallerySection } from "@/components/features/landing/gallery-section";
import { HeroSection } from "@/components/features/landing/hero-section";
import { LocationSection } from "@/components/features/landing/location-section";
import { Marquee } from "@/components/features/landing/marquee";
import { PackagesSection } from "@/components/features/landing/packages-section";
import { TestimonialSection } from "@/components/features/landing/testimonial-section";
import { ThemesSection } from "@/components/features/landing/themes-section";
import { getPricing } from "@/lib/services/pricing-service";
import { getSiteContent } from "@/lib/services/site-content-service";

async function HomeContent() {
  const [
    heroData,
    aboutData,
    galleryData,
    themesData,
    testimonialsData,
    locationData,
    ctaData,
    marqueeData,
    pricing,
  ] = await Promise.all([
    getSiteContent("hero"),
    getSiteContent("about"),
    getSiteContent("gallery"),
    getSiteContent("themes"),
    getSiteContent("testimonials"),
    getSiteContent("location"),
    getSiteContent("cta"),
    getSiteContent("marquee"),
    getPricing(),
  ]);

  const marqueeText = (marqueeData?.text as string[]) || ["HIKARA", "PHOTOBOX"];
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
