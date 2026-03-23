"use client";

import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="h-full flex flex-col justify-end py-12 text-center bg-[#F6F4F0] relative z-0">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-10">
        <div>
          <Image src="/logo.png" width={160} height={48} alt="HIKARA" className="h-16 md:h-20 w-auto mix-blend-multiply opacity-80" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#5A5550] font-medium">
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto">Instagram</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto">WhatsApp</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto">Email</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto">Lokasi Studio</a>
        </div>
        
        <div className="w-full max-w-sm h-px bg-[#2C2A29]/10 my-4"></div>

        <div>
          <p className="text-[10px] md:text-xs text-[#5A5550] font-heading tracking-widest uppercase mb-4">
            Kotabaru, Kalimantan Selatan
          </p>
          <p className="text-[9px] md:text-[10px] text-[#5A5550]/60 tracking-[0.2em] uppercase max-w-xs leading-loose mx-auto">
            &copy; {new Date().getFullYear()} Hikara Photobox. <br />
            Minimalist Photo Experience. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
