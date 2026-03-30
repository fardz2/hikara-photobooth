import { CustomCursor } from "@/components/ui/custom-cursor";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PhotographyBusiness",
    "name": "HIKARA Photobox",
    "image": "https://hikara-photobox.vercel.app/logo.png",
    "@id": "https://hikara-photobox.vercel.app",
    "url": "https://hikara-photobox.vercel.app",
    "telephone": "+6281234567890",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Veteran, Dirgahayu",
      "addressLocality": "Kotabaru",
      "addressRegion": "Kalimantan Selatan",
      "postalCode": "72111",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -3.2389,
      "longitude": 116.2234
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "10:00",
        "closes": "23:00"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/hikara.photobox",
      "https://www.tiktok.com/@hikara.photobox"
    ],
    "description": "Studio foto berkonsep estetika modern minimalis di Kotabaru, Kalimantan Selatan. Abadikan momen kecil menjadi kenangan abadi."
  };

  return (
    <div className="relative min-h-screen bg-[#F6F4F0] text-[#3A3532] font-sans selection:bg-[#8B5E56] selection:text-[#F6F4F0]">
      <CustomCursor />



      {/* Main Content wrapper with z-index floating above the footer */}
      <div className="relative z-10 bg-[#F6F4F0] mb-[500px] md:mb-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          key="ld-json"
        />
        <NoiseOverlay />
        <main>{children}</main>
      </div>


      {/* Parallax Reveal Footer (Fixed under main content) */}
      <div className="fixed bottom-0 left-0 w-full h-[500px] md:h-[400px] z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
