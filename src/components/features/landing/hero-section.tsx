"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp, TextReveal, slowEase } from "@/components/ui/motion";
import { Magnetic } from "@/components/ui/magnetic";

export const HeroSection = () => {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroBgY = useTransform(heroScroll, [0, 1], ["0%", "15%"]);
  const heroTextOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);

  return (
    <section ref={heroRef} className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden">
      <motion.div 
        style={{ y: heroBgY }}
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.04] select-none z-0"
      >
        <span className="font-heading text-[25vw] leading-none text-[#2C2A29] whitespace-nowrap tracking-tighter">
          HIKARA
        </span>
      </motion.div>

      {/* Floating Polaroids */}
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -10 }}
        animate={{ opacity: 1, y: 0, rotate: -12 }}
        transition={{ duration: 1.5, delay: 1 }}
        style={{ y: useTransform(heroScroll, [0, 1], ["0%", "-50%"]) }}
        className="absolute left-[10%] top-[20%] w-32 md:w-48 bg-white p-2 md:p-3 shadow-2xl shadow-[#2C2A29]/10 hidden lg:block z-0 pointer-events-none"
      >
         <div className="aspect-3/4 bg-[#EFEBDE] overflow-hidden">
           <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale opacity-80" alt="Floating Polaroid 1" />
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: 10 }}
        animate={{ opacity: 1, y: 0, rotate: 15 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{ y: useTransform(heroScroll, [0, 1], ["0%", "-80%"]) }}
        className="absolute right-[5%] max-w-[200px] top-[15%] w-32 md:w-40 bg-white p-2 md:p-3 shadow-2xl shadow-[#2C2A29]/10 hidden lg:block z-0 pointer-events-none"
      >
         <div className="aspect-square bg-[#EFEBDE] overflow-hidden">
           <img src="https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale opacity-80" alt="Floating Polaroid 2" />
         </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -5 }}
        animate={{ opacity: 1, y: 0, rotate: -5 }}
        transition={{ duration: 1.5, delay: 1.4 }}
        style={{ y: useTransform(heroScroll, [0, 1], ["0%", "-30%"]) }}
        className="absolute right-[15%] bottom-[10%] w-40 md:w-56 bg-white p-2 md:p-3 shadow-2xl shadow-[#2C2A29]/10 hidden lg:block z-0 pointer-events-none"
      >
         <div className="aspect-4/3 bg-[#EFEBDE] overflow-hidden">
           <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale opacity-80" alt="Floating Polaroid 3" />
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.8, ease: slowEase }}
        className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 text-[#8B5E56]/40 font-serif text-xl md:text-3xl tracking-[0.5em] pointer-events-none hidden sm:block" 
        style={{ writingMode: 'vertical-rl' }}
      >
        フォトブース
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, delay: 0.8, ease: slowEase }}
        className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 text-[#2C2A29]/20 font-serif text-sm tracking-[1em] uppercase pointer-events-none hidden sm:block" 
        style={{ writingMode: 'vertical-rl' }}
      >
        Capture The Moment
      </motion.div>

      <motion.div style={{ y: heroTextY, opacity: heroTextOpacity }} className="max-w-4xl z-10">
        <FadeUp delay={0.2} className="flex flex-col items-center gap-4 mb-8">
          <span className="text-[#8B5E56] text-xs md:text-sm tracking-[0.5em] uppercase font-heading font-medium">HIKARA PHOTOBOX</span>
          <span className="w-12 h-px bg-[#8B5E56]/50 mb-2"></span>
          
          <h1 className="flex flex-col items-center">
            <span className="sr-only">HIKARA Photobox Kotabaru - Studio Foto Premium & Estetik. </span>
            <div className="overflow-hidden">
              <h1 className="block font-heading text-5xl md:text-7xl lg:text-8xl text-[#2C2A29] leading-[1.1] tracking-wide">
                <TextReveal text="MOMEN KECIL," delay={0.2} />
              </h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="block font-heading text-5xl md:text-7xl lg:text-8xl text-[#2C2A29] leading-[1.1] tracking-wide mt-2">
                <span className="text-[#8B5E56] italic font-serif pr-2">KENANGAN</span>
                <TextReveal text="ABADI" delay={0.4} />
              </h1>
            </div>
          </h1>
        </FadeUp>

        <FadeUp delay={0.8}>
          <p className="font-light text-sm md:text-base tracking-[0.2em] leading-relaxed text-[#5A5550] mb-12 max-w-lg mx-auto uppercase">
            Photobox estetik dengan sentuhan minimalis. 
            <span className="block mt-2 font-serif text-lg tracking-widest text-[#8B5E56] capitalize">Tangkap versi terbaik dari dirimu.</span>
          </p>
        </FadeUp>

        <FadeUp delay={1.1}>
          <Magnetic intensity={0.15}>
            <a
              href="#packages"
              className="inline-block border border-[#2C2A29] text-[#2C2A29] hover:bg-[#2C2A29] hover:text-[#F6F4F0] transition-colors duration-700 text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase px-10 py-5"
            >
              Book Sekarang
            </a>
          </Magnetic>
        </FadeUp>
      </motion.div>
    </section>
  );
};
