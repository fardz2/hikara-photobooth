import {
  FadeUp,
  FadeRight,
  StaggerContainer,
  StaggerItem,
  ParallaxElement,
} from "@/components/ui/motion";

export const PackagesSection = () => {
  return (
    <section
      id="packages"
      className="py-24 md:py-40 flex flex-col px-6 bg-[#F6F4F0] relative overflow-hidden"
    >
      <ParallaxElement direction="up" offset={200} className="absolute right-0 top-0 text-[#2C2A29]/5 font-serif text-[15rem] leading-none pointer-events-none select-none hidden lg:block overflow-visible mix-blend-multiply">
        HARGA
      </ParallaxElement>
      <div className="absolute left-6 md:left-24 bottom-24 hidden lg:block opacity-[0.2] z-0">
         <span className="font-sans text-[10px] tracking-[0.5em] text-[#2C2A29] uppercase border-l border-[#8B5E56] pl-4">PILIH PAKET</span>
      </div>
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[#2C2A29] opacity-[0.02] font-heading text-[25vw] leading-none pointer-events-none whitespace-nowrap z-0 mix-blend-multiply origin-left -rotate-90">
        HARGA
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative z-10">
        <div className="lg:col-span-5 h-fit lg:sticky top-40 flex flex-col items-center lg:items-start text-center lg:text-left">
          <FadeUp>
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-8 font-sans font-medium flex items-center justify-center lg:justify-start gap-4">
              <span className="w-8 h-px bg-[#8B5E56] hidden lg:block"></span>
              Paket
              <span className="font-serif text-[#2C2A29]/50 ml-2 text-[10px] tracking-[0.2em] uppercase">HARGA</span>
              <span className="w-8 h-px bg-[#8B5E56] lg:hidden"></span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.2} className="mb-16 lg:mb-0">
            <h3 className="font-heading text-4xl md:text-5xl lg:text-5xl text-[#2C2A29] mb-8 tracking-tight">Investasi Momen Kita</h3>
            <p className="font-heading tracking-[0.15em] text-[#5A5550] text-sm md:text-base uppercase">
              Senin - Minggu
            </p>
            <p className="font-light tracking-[0.2em] text-[#2C2A29]/60 text-xs mt-2">
              14:00 - 23:00
            </p>
          </FadeUp>
        </div>

        <div className="lg:col-span-7">
          <StaggerContainer
            delayOrder={0.3}
            className="flex flex-col gap-10 w-full relative"
          >
            <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-6 text-center md:text-left gap-2 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500 relative">
              <div className="relative z-10 w-full md:w-auto">
                <h3 className="font-heading text-xl md:text-2xl text-[#2C2A29] mb-1 group-hover:text-[#8B5E56] transition-colors uppercase tracking-widest text-left">
                  Foto per Sesi + Print 2 Photostrip
                </h3>
                <p className="font-light tracking-[0.2em] text-[#5A5550] text-[10px] md:text-xs text-left">
                  (MAX. 4 ORANG)
                </p>
              </div>
              <div className="text-[#2C2A29] font-medium tracking-widest text-sm mt-4 md:mt-0 relative z-10 text-left w-full md:w-auto">
                RP. 35.000
              </div>
            </StaggerItem>

            <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-6 text-center md:text-left gap-2 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500 relative">
              <div className="relative z-10 w-full md:w-auto">
                <h3 className="font-heading text-xl md:text-2xl text-[#2C2A29] mb-1 group-hover:text-[#8B5E56] transition-colors uppercase tracking-widest text-left">
                  Tambahan per Orang
                </h3>
              </div>
              <div className="text-[#2C2A29] font-medium tracking-widest text-sm mt-4 md:mt-0 relative z-10 text-left w-full md:w-auto">
                RP. 5.000
              </div>
            </StaggerItem>

            <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-6 text-center md:text-left gap-2 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500 relative">
              <div className="relative z-10 w-full md:w-auto">
                <h3 className="font-heading text-xl md:text-2xl text-[#2C2A29] mb-1 group-hover:text-[#8B5E56] transition-colors uppercase tracking-widest text-left">
                  Extra Print
                </h3>
              </div>
              <div className="text-[#2C2A29] font-medium tracking-widest text-sm mt-4 md:mt-0 relative z-10 text-left w-full md:w-auto">
                RP. 10.000
              </div>
            </StaggerItem>

            <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-6 text-center md:text-left gap-2 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500 relative">
              <div className="relative z-10 w-full md:w-auto">
                <h3 className="font-heading text-xl md:text-2xl text-[#2C2A29] mb-1 group-hover:text-[#8B5E56] transition-colors uppercase tracking-widest text-left">
                  Custom Frame Birthday, Dll
                </h3>
              </div>
              <div className="text-[#2C2A29] font-medium tracking-widest text-sm mt-4 md:mt-0 relative z-10 text-left w-full md:w-auto">
                RP. 15.000
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};
