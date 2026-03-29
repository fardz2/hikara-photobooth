"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slowEase } from "@/components/ui/motion";
import { Magnetic } from "@/components/ui/magnetic";
import Image from "next/image";
import { useState, useEffect } from "react";

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: slowEase }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-between items-center ${
        scrolled 
          ? "p-4 md:p-6 bg-white/70 backdrop-blur-md border-b border-[#2C2A29]/5" 
          : "p-6 md:p-12 bg-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <Image src="/logo.png" width={160} height={48} alt="HIKARA" className="h-10 md:h-12 w-auto mix-blend-multiply opacity-90" />
      </div>
      <div className="flex gap-4 md:gap-6 text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium text-[#2C2A29]">
        <Magnetic intensity={0.1}>
          <a href="#about" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">Tentang Kami</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#themes" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">Tema</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#gallery" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">Galeri</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#packages" className="hover:text-[#8B5E56] transition-colors px-2 py-1 outline-none">Paket</a>
        </Magnetic>
        <Magnetic intensity={0.1}>
          <a href="#location" className="hover:text-[#8B5E56] transition-colors hidden md:block px-2 py-1 outline-none">Lokasi</a>
        </Magnetic>
      </div>
    </motion.nav>
  );
};
