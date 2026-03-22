"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp } from "@/components/ui/motion";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop",
];

export const GallerySection = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={targetRef} id="gallery" className="relative h-[300vh] bg-[#F6F4F0]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Title Overlay */}
        <div className="absolute top-20 md:top-32 left-6 md:left-24 z-20">
          <FadeUp>
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] font-sans font-medium flex items-center gap-4 bg-[#F6F4F0]/80 backdrop-blur-sm p-2 rounded">
              Gallery
              <span className="font-serif text-[#2C2A29]/50 ml-2">ギャラリー</span>
            </h2>
          </FadeUp>
        </div>

        {/* Scroll Instruction */}
        <div className="absolute bottom-12 md:bottom-20 left-6 md:left-24 z-20 hidden md:flex items-center gap-4 opacity-50">
          <span className="w-12 h-px bg-[#2C2A29]"></span>
          <span className="text-[10px] uppercase tracking-widest font-heading font-bold text-[#2C2A29]">Scroll Down to Slide</span>
        </div>

        {/* Scrolling Strip */}
        <motion.div style={{ x }} className="flex gap-12 md:gap-24 px-6 md:px-32 relative z-10 items-center">
          {GALLERY_IMAGES.map((img, idx) => (
            <div key={idx} className={`w-[75vw] md:w-[35vw] shrink-0 relative group cursor-pointer ${idx % 2 === 0 ? '-mb-12 md:-mb-24' : 'mb-12 md:mt-24'}`}>
              <div className="aspect-3/4 overflow-hidden bg-[#EFEBDE] relative shadow-2xl shadow-[#2C2A29]/10">
                {/* Custom Hover Mask Reveal (Desktop Only) */}
                <div className="absolute inset-0 bg-[#EFEBDE] z-10 origin-bottom transform transition-transform duration-1000 md:group-hover:scale-y-0 scale-y-0 md:scale-y-100"></div>
                <img
                  src={img}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover filter md:grayscale md:opacity-90 transition-all duration-1000 md:group-hover:grayscale-0 md:group-hover:opacity-100 md:group-hover:scale-105"
                />
                {/* Overlay Border */}
                <div className="absolute inset-0 border border-white/0 md:group-hover:border-white/30 z-20 transition-colors duration-700 pointer-events-none m-4 mix-blend-overlay"></div>
              </div>
              
              <div className="mt-4 flex justify-between items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-[#5A5550]">Vol. 0{idx + 1}</span>
                <span className="font-serif text-[#8B5E56] text-sm">写真</span>
              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Background Typography */}
        <div className="absolute bottom-4 right-10 z-0 opacity-[0.03] pointer-events-none hidden md:block">
          <h2 className="font-heading text-[18vw] leading-none text-[#2C2A29] tracking-tighter">MOMENTS</h2>
        </div>
        <div className="absolute top-20 right-20 z-0 opacity-[0.03] pointer-events-none hidden lg:block">
          <span className="font-serif text-[15vw] leading-none text-[#2C2A29] writing-vertical-rl">愛</span>
        </div>

      </div>
    </section>
  );
};
