import { FadeUp } from "@/components/ui/motion";
import { Magnetic } from "@/components/ui/magnetic";
import Link from "next/link";

export const CtaSection = () => {
  return (
    <section className="py-32 md:py-48 flex flex-col items-center justify-center text-center px-6 bg-[#EFEBDE]/30 relative overflow-hidden border-t border-[#2C2A29]/5">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2C2A29] opacity-[0.03] font-heading text-[25vw] md:text-[30vw] leading-none pointer-events-none whitespace-nowrap z-0 mix-blend-multiply">
        RESERVASI
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-16 bg-[#2C2A29]/20 z-0"></div>

      <FadeUp className="relative z-10 w-full flex flex-col items-center">
        <h2 className="font-heading text-4xl md:text-6xl text-[#2C2A29] mb-6 md:mb-12 max-w-3xl leading-tight">
          SIAP MENGABADIKAN MOMEN?
        </h2>
      </FadeUp>
      <FadeUp delay={0.2} className="relative z-10">
        <Magnetic intensity={0.1}>
          <div className="relative group mt-4">
            <div className="absolute inset-0 bg-[#8B5E56] translate-x-2 translate-y-2 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"></div>
            <Link
              href="/reservasi"
              className="relative block bg-[#2C2A29] text-[#F6F4F0] transition-colors duration-500 text-xs md:text-sm font-medium tracking-[0.3em] uppercase px-12 py-6 border border-[#2C2A29]"
            >
              Reserve Now
            </Link>
          </div>
        </Magnetic>
      </FadeUp>
      <FadeUp delay={0.4} className="relative z-10 mt-16 md:mt-20">
        <p className="font-serif text-[#8B5E56] text-xl md:text-2xl opacity-80 uppercase tracking-[0.5em] ml-[0.5em]">Hikara</p>
      </FadeUp>
    </section>
  );
};
