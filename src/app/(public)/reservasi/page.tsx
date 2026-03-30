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
  title: "Reservasi | Hikara Photobox",
  description: "Pesan jadwal photoshoot Anda di Hikara Photobooth sekarang.",
};

export default function ReservasiPage() {
  return (
    <main className="pt-32 md:pt-48 pb-24 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
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
          <span className="font-medium text-[#2C2A29]">
            INFO OPERASIONAL
          </span>
          <span>10:00 - 23:00 WITA</span>
          <span>Monday - Sunday</span>
        </div>
      </div>

      <div className="w-full lg:w-2/3 bg-white p-8 md:p-12 shadow-xl border border-[#2C2A29]/10">
        <Suspense fallback={<ReservationFormSkeleton />}>
          <ReservationForm />
        </Suspense>
      </div>
    </main>
  );
}
