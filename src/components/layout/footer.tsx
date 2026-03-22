"use client";

import { StaggerContainer, StaggerItem } from "@/components/ui/motion";

export const Footer = () => {
  return (
    <footer className="py-12 border-t border-[#2C2A29]/10 text-center bg-[#F6F4F0] relative z-10">
      <StaggerContainer className="container mx-auto px-6 flex flex-col items-center justify-center gap-10">
        <StaggerItem>
          <img src="/logo.png" alt="HIKARA" className="h-16 md:h-20 w-auto mix-blend-multiply opacity-80" />
        </StaggerItem>
        
        <StaggerItem className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#5A5550] font-medium">
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300">Instagram</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300">WhatsApp</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300">Email</a>
          <a href="#" className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300">Lokasi Studio</a>
        </StaggerItem>
        
        <StaggerItem className="w-full max-w-sm h-px bg-[#2C2A29]/10 my-4"></StaggerItem>

        <StaggerItem>
          <p className="text-[9px] md:text-[10px] text-[#5A5550]/60 tracking-[0.2em] uppercase max-w-xs leading-loose">
            &copy; {new Date().getFullYear()} Hikara Photobooth. <br />
            Minimalist Photo Experience. All Rights Reserved.
          </p>
        </StaggerItem>
      </StaggerContainer>
    </footer>
  );
};
