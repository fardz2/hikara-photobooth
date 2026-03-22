"use client";

import { FadeUp, RevealImage } from "@/components/ui/motion";

export const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-6 bg-[#EFEBDE]/30">
      <FadeUp>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-16 font-sans font-medium flex items-center justify-center gap-4 relative z-10">
          Gallery
          <span className="font-serif text-[#2C2A29]/50 ml-2">ギャラリー</span>
        </h2>
      </FadeUp>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-12 relative z-10">
        <div className="space-y-4 md:space-y-12 mt-0 sm:mt-16">
          <RevealImage delay={0} src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" alt="Analog Portrait" className="aspect-4/3 sm:aspect-[3/4] bg-[#EFEBDE] group" />
          <RevealImage delay={0.2} src="https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=800&auto=format&fit=crop" alt="Friends Candid" className="aspect-4/3 bg-[#EFEBDE] group" />
        </div>
        <div className="space-y-4 md:space-y-12">
          <RevealImage delay={0.1} src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop" alt="Minimalist Portrait" className="aspect-4/3 bg-[#EFEBDE] group" />
          <RevealImage delay={0.3} src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop" alt="Group Photo" className="aspect-4/3 sm:aspect-[3/4] bg-[#EFEBDE] group" />
        </div>
      </div>
    </section>
  );
};
