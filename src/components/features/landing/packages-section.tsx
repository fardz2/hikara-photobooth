"use client";

import { motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem, slowEase } from "@/components/ui/motion";

export const PackagesSection = () => {
  return (
    <section id="packages" className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-6 bg-[#F6F4F0] relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: slowEase }}
        className="absolute right-0 top-0 text-[#2C2A29]/2 font-serif text-[15rem] leading-none pointer-events-none select-none hidden lg:block overflow-hidden"
      >
        パッケージ
      </motion.div>

      <FadeUp>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-20 font-sans font-medium flex items-center gap-4 relative z-10">
          <span className="w-8 h-px bg-[#8B5E56]"></span>
          Paket
          <span className="font-serif text-[#2C2A29]/50 ml-2">パッケージ</span>
          <span className="w-8 h-px bg-[#8B5E56]"></span>
        </h2>
      </FadeUp>
      
      <StaggerContainer delayOrder={0.3} className="flex flex-col gap-12 w-full max-w-2xl mx-auto relative z-10 px-4">
        <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-8 text-center md:text-left gap-4 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500">
          <div>
            <h3 className="font-heading text-2xl md:text-3xl text-[#2C2A29] mb-2 group-hover:text-[#8B5E56] transition-colors">Basic Session</h3>
            <p className="font-light tracking-[0.2em] text-[#5A5550]">
              30 MENIT <span className="mx-2 font-serif italic text-sm text-[#8B5E56]">/</span> 4 CETAKAN
            </p>
          </div>
          <div className="text-[#2C2A29] font-medium tracking-widest text-sm">
            IDR 1.500K
          </div>
        </StaggerItem>

        <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-8 text-center md:text-left gap-4 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500">
          <div>
            <h3 className="font-heading text-2xl md:text-3xl text-[#2C2A29] mb-2 flex items-center gap-3 justify-center md:justify-start group-hover:text-[#8B5E56] transition-colors">
              Premium Session
              <span className="text-[8px] bg-[#8B5E56] text-[#F6F4F0] px-2 py-1 tracking-widest uppercase align-middle">Popular</span>
            </h3>
            <p className="font-light tracking-[0.2em] text-[#5A5550] max-w-xs md:max-w-none mx-auto md:mx-0">
              60 MENIT <span className="mx-2 font-serif italic text-sm text-[#8B5E56]">/</span> 10 CETAKAN + DIGITAL COPY
            </p>
          </div>
          <div className="text-[#2C2A29] font-medium tracking-widest text-sm">
            IDR 2.800K
          </div>
        </StaggerItem>

        <StaggerItem className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-[#2C2A29]/20 pb-8 text-center md:text-left gap-4 md:gap-0 group hover:border-[#8B5E56] transition-colors duration-500">
          <div>
            <h3 className="font-heading text-2xl md:text-3xl text-[#2C2A29] mb-2 group-hover:text-[#8B5E56] transition-colors">Wedding Installation</h3>
            <p className="font-light tracking-[0.2em] text-[#5A5550]">
              UNLIMITED <span className="mx-2 font-serif italic text-sm text-[#8B5E56]">/</span> FULL BACKDROP SETUP
            </p>
          </div>
          <div className="text-[#2C2A29] font-medium tracking-widest text-sm">
            Custom Quote
          </div>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
};
