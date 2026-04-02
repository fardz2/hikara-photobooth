"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export const slowEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, delay, ease: slowEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const RevealImage = ({ 
  src, 
  alt, 
  className = "", 
  delay = 0,
  sizes = "100vw"
}: { 
  src: string, 
  alt: string, 
  className?: string, 
  delay?: number,
  sizes?: string
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, delay, ease: slowEase }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: delay + 0.1, ease: slowEase }}
        className="w-full h-full relative group-hover:scale-105 transition-all duration-1000 ease-out"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out"
        />
      </motion.div>
      <div className="absolute inset-0 bg-transparent border border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none m-4"></div>
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "", delayOrder = 0.2 }: { children: React.ReactNode, className?: string, delayOrder?: number }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: delayOrder, delayChildren: 0.2 }
    }
  };
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: slowEase } }
  };
  return <motion.div variants={itemVariants} className={className}>{children}</motion.div>;
};

export const FadeRight = ({ children, delay = 0, className = "" }: { children?: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: slowEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const InfiniteMarquee = ({ children, className = "", duration = 30 }: { children?: React.ReactNode, className?: string, duration?: number }) => {
  return (
    <motion.div
      className={className}
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, ease: "linear", duration }}
    >
      {children}
    </motion.div>
  );
};

export const TextReveal = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em] align-bottom pb-2">
          <motion.span
            initial={{ y: "150%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 1.4,
              delay: delay + wordIndex * 0.15,
              ease: slowEase,
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const ImageMaskReveal = ({ 
  src, 
  alt, 
  className = "", 
  delay = 0,
  sizes = "100vw"
}: { 
  src: string, 
  alt: string, 
  className?: string, 
  delay?: number,
  sizes?: string
}) => {
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <motion.div
        initial={{ y: "0%" }}
        whileInView={{ y: "-100%" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.6, delay, ease: slowEase }}
        className="absolute inset-0 z-10 bg-[#EFEBDE] origin-bottom"
      />
      <motion.div
        initial={{ scale: 1.15, filter: "grayscale(100%) opacity(0.8)" }}
        whileInView={{ scale: 1, filter: "grayscale(30%) opacity(1)" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2.2, delay: delay + 0.2, ease: slowEase }}
        className="w-full h-full relative group-hover:scale-105 group-hover:filter-none group-hover:opacity-100 transition-all duration-1000 ease-out"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-all duration-1000 ease-out"
        />
      </motion.div>
      <div className="absolute inset-0 bg-transparent border border-[#2C2A29]/0 group-hover:border-[#F6F4F0]/30 transition-all duration-700 pointer-events-none z-20 mix-blend-overlay"></div>
    </div>
  );
};

export const ParallaxElement = ({ 
  children, 
  className = "", 
  offset = 150,
  direction = "up"
}: { 
  children: React.ReactNode, 
  className?: string, 
  offset?: number,
  direction?: "up" | "down"
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], direction === "up" ? [offset, -offset] : [-offset, offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

