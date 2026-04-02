import { Suspense } from "react";
import { Metadata } from "next";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { ReservationForm } from "@/components/features/reservation/reservation-form";
import { ReservationFormSkeleton } from "@/components/skeletons/reservation-form-skeleton";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Reservasi Photobox Premium - Hikara Photobox Kotabaru",
  description:
    "Jadwalkan sesi foto studio premium Anda di Hikara Photobox Kotabaru. Tersedia berbagai pilihan frame eksklusif dan cetakan berkualitas tinggi.",
};

export default function ReservasiPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://hikara-photobox.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Reservasi",
        item: "https://hikara-photobox.vercel.app/reservasi",
      },
    ],
  };

  return (
    <div className="pt-32 md:pt-48 pb-24 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        key="breadcrumb-json"
      />
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <h1 className="font-heading text-4xl md:text-5xl text-[#2C2A29] tracking-tight">
          Kunci Momen Anda
        </h1>
        <p className="text-sm text-[#5A5550] leading-loose">
          Jadwalkan sesi foto Anda dan nikmati pengalaman studio eksklusif
          bersama kami.
        </p>
        <div className="w-16 h-px bg-[#8B5E56] my-4"></div>
        <div className="flex flex-col gap-2 text-xs tracking-widest text-[#5A5550] uppercase">
          <span className="font-medium text-[#2C2A29]">INFO OPERASIONAL</span>
          <span>14:00 - 23:00 WITA</span>
          <span>Monday - Sunday</span>
        </div>
      </div>

      <div className="w-full lg:w-2/3 bg-white p-8 md:p-12 shadow-xl border border-[#2C2A29]/10">
        <Suspense fallback={<ReservationFormSkeleton />}>
          <ReservationForm />
        </Suspense>
      </div>
    </div>
  );
}
