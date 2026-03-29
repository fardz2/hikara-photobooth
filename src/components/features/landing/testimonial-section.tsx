"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "@/components/ui/motion";

const TESTIMONIALS = [
  {
    quote: "Pengalaman photobox yang belum pernah ada di Kotabaru. Lightingnya benar-benar terasa seperti studio eksklusif. Sangat premium!",
    author: "RANI & ANDI",
    context: "Sesi Prewedding"
  },
  {
    quote: "Suka banget sama hasil print Classic Strip-nya. Filter Tokyo Vintage benar-benar bikin foto biasa jadi estetik parah.",
    author: "SABRINA",
    context: "Sesi Graduation"
  },
  {
    quote: "Tempatnya nyaman banget, privasi terjaga. Kualitas kertas cetakan tebal dan anti-luntur. Experience 10/10!",
    author: "KEVIN W.",
    context: "Family Portrait"
  }
];

export const TestimonialSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 md:py-48 bg-[#EFEBDE]/30 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2C2A29] opacity-[0.02] font-heading text-[25vw] leading-none pointer-events-none whitespace-nowrap z-0 mix-blend-multiply">
        CERITA
      </div>

      <FadeUp>
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-16 font-sans font-medium flex items-center justify-center gap-4 relative z-10">
          <span className="w-8 h-px bg-[#8B5E56]"></span>
            Kisah Mereka
          <span className="w-8 h-px bg-[#8B5E56]"></span>
        </span>
      </FadeUp>

      <div className="max-w-4xl mx-auto relative z-10 min-h-[300px] md:min-h-[250px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center px-4"
          >
            <span className="text-8xl text-[#8B5E56]/30 font-serif leading-none h-10 block mb-4">"</span>
            <p className="font-heading text-2xl md:text-5xl text-[#2C2A29] leading-relaxed md:leading-tight tracking-wide mb-10 max-w-4xl text-center">
              {TESTIMONIALS[current].quote}
            </p>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-sans tracking-[0.3em] font-bold text-[#2C2A29] uppercase">{TESTIMONIALS[current].author}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] italic font-serif text-[#8B5E56]">{TESTIMONIALS[current].context}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-12 z-10">
        {TESTIMONIALS.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrent(idx)}
            className={`w-16 h-[2px] cursor-none transition-all duration-700 ${current === idx ? "bg-[#8B5E56] scale-y-150" : "bg-[#2C2A29]/20 hover:bg-[#2C2A29]/50"}`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
