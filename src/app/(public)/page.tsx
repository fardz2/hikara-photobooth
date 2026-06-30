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

// Default data — will be replaced by DB values once site_content is populated
const DEFAULT_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop",
];

const DEFAULT_THEMES = [
  {
    name: "Classic Monochrome",
    desc: "Nuansa hitam putih abadi dengan kontras yang dramatis. Sempurna untuk ekspresi tegas dan editorial.",
    img: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop",
    ],
  },
  {
    name: "Tokyo Vintage",
    desc: "Warna analog pudar khas cuci film 90-an. Membawa kembali kenangan hangat yang bernuansa nostalgia.",
    img: "https://images.unsplash.com/photo-1542051842920-c7aa7111c12e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Soft Cinematic",
    desc: "Tonasi pastel hangat yang memberikan kesan dreamy. Sangat lembut dan cocok untuk momen manis berpasangan.",
    img: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Y2K Pop",
    desc: "Saturasi tinggi dengan sentuhan lo-fi retro 2000-an. Sangat energetik, ceria, dan cocok untuk grup dinamis.",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    quote: "Pengalaman photobox yang belum pernah ada di Kotabaru. Lightingnya benar-benar terasa seperti studio eksklusif. Sangat premium!",
    author: "RANI & ANDI",
    context: "Sesi Prewedding",
  },
  {
    quote: "Suka banget sama hasil print Classic Strip-nya. Filter Tokyo Vintage benar-benar bikin foto biasa jadi estetik parah.",
    author: "SABRINA",
    context: "Sesi Graduation",
  },
  {
    quote: "Tempatnya nyaman banget, privasi terjaga. Kualitas kertas cetakan tebal dan anti-luntur. Experience 10/10!",
    author: "KEVIN W.",
    context: "Family Portrait",
  },
];

const DEFAULT_PRICING = {
  paket_utama: { label: "Foto per Sesi + Print 2 Photostrip", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
  extra_person: { label: "Tambahan per Orang", price: 5000 },
  extra_print: { label: "Extra Print", price: 10000 },
  custom_frame: { label: "Custom Frame Birthday, Dll", price: 15000 },
};

export default function Home() {
  return (
    <>
      <Nav />
      <HeroSection data={null} />
      <Marquee text={["HIKARA", "PHOTOBOX", "STUDIO QUALITY", "MEMORIES"]} />
      <AboutSection data={null} />
      <GallerySection images={DEFAULT_GALLERY_IMAGES} />
      <ThemesSection items={DEFAULT_THEMES} />
      <PackagesSection pricing={DEFAULT_PRICING} />
      <Marquee text={["HIKARA", "PHOTOBOX", "STUDIO QUALITY", "MEMORIES"]} />
      <TestimonialSection items={DEFAULT_TESTIMONIALS} />
      <LocationSection data={null} />
      <CtaSection data={null} />
      <AnchorSection />
    </>
  );
}
