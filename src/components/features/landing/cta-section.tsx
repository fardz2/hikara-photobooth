"use client";

import { FadeUp } from "@/components/ui/motion";

export const CtaSection = () => {
  return (
    <section className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-6 bg-[#EFEBDE]/30">
      <FadeUp>
        <h2 className="font-heading text-4xl md:text-6xl text-[#2C2A29] mb-12 max-w-3xl leading-tight">
          SIAP MENGABADIKAN MOMEN?
        </h2>
      </FadeUp>
      <FadeUp delay={0.2}>
        <a
          href="#packages"
          className="inline-block bg-[#2C2A29] text-[#F6F4F0] hover:bg-[#8B5E56] transition-colors duration-500 text-xs md:text-sm font-medium tracking-[0.3em] uppercase px-12 py-6 mb-8"
        >
          Reservasi Sekarang
        </a>
      </FadeUp>
      <FadeUp delay={0.4}>
        <p className="font-serif text-[#8B5E56] text-xl opacity-80">
          ひから
        </p>
      </FadeUp>
    </section>
  );
};
