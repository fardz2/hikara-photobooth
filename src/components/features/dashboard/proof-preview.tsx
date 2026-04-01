"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  Add01Icon,
  Remove01Icon,
  ArrowReloadHorizontalIcon,
  Cancel01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProofPreviewProps {
  url: string;
  trigger?: React.ReactNode;
}

export const ProofPreview = ({ url, trigger }: ProofPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Reset zoom and position when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));

  const handleReset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
    controls.start({ x: 0, y: 0, scale: 1 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-[8px] text-[#8B5E56] font-bold hover:underline underline-offset-2 flex items-center gap-1">
            <HugeiconsIcon icon={ViewIcon} size={10} />
            Cek Bukti
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-[#2C2A29]/95 border-[#2C2A29]/10 rounded-none sm:rounded-none flex flex-col">
        <DialogTitle className="sr-only">Bukti Pembayaran</DialogTitle>
        <DialogDescription className="sr-only">
          Pratinjau bukti transfer QRIS
        </DialogDescription>

        {/* Header Controls */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-1 flex items-center gap-1 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 rounded-none"
              onClick={handleZoomOut}
              disabled={scale <= 1}
            >
              <HugeiconsIcon icon={Remove01Icon} size={16} />
            </Button>
            <div className="px-2 text-[10px] font-bold text-white min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 rounded-none"
              onClick={handleZoomIn}
              disabled={scale >= 5}
            >
              <HugeiconsIcon icon={Add01Icon} size={16} />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/20 rounded-none"
              onClick={handleReset}
            >
              <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={16} />
            </Button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="size-8 bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-2xl"
          >
            <HugeiconsIcon icon={Download01Icon} size={16} />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 rounded-none shadow-2xl"
            onClick={() => setIsOpen(false)}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        {/* Image Viewer Area */}
        <div
          ref={constraintsRef}
          className="flex-1 w-full relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
        >
          <motion.div
            drag={scale > 1}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            style={{ x, y, scale }}
            animate={controls}
            className="relative transition-transform duration-200 ease-out"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Bukti Pembayaran"
              className="max-h-[80vh] max-w-full object-contain pointer-events-none shadow-2xl border border-white/5"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/5 flex justify-center text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">
            Gunakan Mouse Wheel untuk Zoom • Geser untuk Navigasi
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
