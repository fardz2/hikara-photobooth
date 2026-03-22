"use client";

import { motion } from "framer-motion";
import { slowEase } from "@/components/ui/motion";
import { Magnetic } from "@/components/ui/magnetic";

export const Nav = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: slowEase }}
      className="absolute top-0 left-0 right-0 z-40 p-6 md:p-12 flex justify-between items-center"
    >
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="HIKARA" className="h-10 md:h-12 w-auto mix-blend-multiply opacity-90" />
      </div>
      <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium text-[#2C2A29]">
        <Magnetic intensity={0.1}>
          <a href="#about" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">About</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#gallery" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">Gallery</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#packages" className="hover:text-[#8B5E56] transition-colors px-2 py-1 outline-none">Book</a>
        </Magnetic>
      </div>
    </motion.nav>
  );
};
