"use client";

import React from "react";
import { motion } from "framer-motion";

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

export const RevealImage = ({ src, alt, className = "", delay = 0 }: { src: string, alt: string, className?: string, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, delay, ease: slowEase }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.img
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: delay + 0.1, ease: slowEase }}
        src={src}
        alt={alt}
        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out group-hover:scale-105"
      />
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
