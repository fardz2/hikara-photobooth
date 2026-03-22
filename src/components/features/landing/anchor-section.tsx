"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeUp } from "@/components/ui/motion";

export const AnchorSection = () => {
  const anchorRef = useRef(null);
  const { scrollYProgress: anchorScroll } = useScroll({ target: anchorRef, offset: ["start end", "center center"] });
  const brandScale = useTransform(anchorScroll, [0, 1], [0.8, 1]);
  const brandOpacity = useTransform(anchorScroll, [0, 1], [0, 0.9]);

  return (
    <section ref={anchorRef} className="bg-[#F6F4F0] pt-32 pb-10 overflow-hidden flex flex-col items-center justify-center gap-2">
      <FadeUp>
        <span className="text-[#8B5E56] text-[10px] tracking-[0.5em] uppercase font-heading">THE PREMIUM PHOTO EXPERIENCE</span>
      </FadeUp>
      <motion.h2 
        style={{ scale: brandScale, opacity: brandOpacity }}
        className="font-heading text-[18vw] leading-none text-[#2C2A29] tracking-tighter hover:text-[#8B5E56] transition-colors duration-700 select-none cursor-default py-4"
      >
        HIKARA<span className="text-[#8B5E56]">.</span>
      </motion.h2>
    </section>
  );
};
