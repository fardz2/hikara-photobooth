"use client";

import { motion } from "framer-motion";

export const Marquee = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-[#2C2A29]/10 py-6 flex items-center bg-[#EFEBDE]/50">
      <motion.div
        className="flex gap-16 text-[#2C2A29]/40 text-xs md:text-sm tracking-[0.4em] font-medium uppercase font-heading min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="flex items-center gap-16">
            <span>HIKARA PHOTOBOX</span>
            <span className="font-serif text-sm">永遠の思い出</span>
            <span>STUDIO QUALITY</span>
            <span className="font-serif text-sm">光</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};
