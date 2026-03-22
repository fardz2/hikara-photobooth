"use client";

import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-6 bg-transparent">
      <FadeUp>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-4 font-sans font-medium flex items-center gap-4">
          <span className="w-8 h-px bg-[#8B5E56]"></span>
          Tentang Kami
          <span className="font-serif text-[#2C2A29]/50 ml-2">私たちについて</span>
          <span className="w-8 h-px bg-[#8B5E56]"></span>
        </h2>
      </FadeUp>
      
      <FadeUp delay={0.2} className="w-full">
        <p className="font-heading text-2xl md:text-4xl text-[#2C2A29] max-w-3xl leading-relaxed my-12 mx-auto">
          Kami menciptakan ruang sederhana untuk menangkap momen yang jujur dan apa adanya.
          <span className="block mt-6 text-sm font-sans font-light tracking-widest text-[#5A5550] uppercase leading-loose">
            Desain elegan, pencahayaan presisi, dan estetika majalah dalam setiap cetakan.
          </span>
        </p>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mt-16 max-w-5xl mx-auto w-full border-t border-[#2C2A29]/10 pt-16">
        <StaggerItem className="flex flex-col items-center text-center">
          <span className="font-serif text-3xl text-[#8B5E56] mb-4 opacity-50">予約</span>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#2C2A29] font-medium mb-2">1. Reservasi</h4>
          <p className="text-xs font-light text-[#5A5550] max-w-xs">Pilih paket dan sesuaikan dengan tema acara spesial Anda.</p>
        </StaggerItem>
        <StaggerItem className="flex flex-col items-center text-center">
          <span className="font-serif text-3xl text-[#8B5E56] mb-4 opacity-50">撮影</span>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#2C2A29] font-medium mb-2">2. Sesi Foto</h4>
          <p className="text-xs font-light text-[#5A5550] max-w-xs">Ruang privat untuk berekspresi tanpa batas dengan lighting studio.</p>
        </StaggerItem>
        <StaggerItem className="flex flex-col items-center text-center">
          <span className="font-serif text-3xl text-[#8B5E56] mb-4 opacity-50">結果</span>
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#2C2A29] font-medium mb-2">3. Hasil Cetak</h4>
          <p className="text-xs font-light text-[#5A5550] max-w-xs">Terima memori fisik berkualitas tinggi berestetika analog.</p>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
};
