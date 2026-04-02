"use client";

import { FadeUp, ImageMaskReveal } from "@/components/ui/motion";
import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";
import { useRef } from "react";
import { 
  motion, 
  useScroll, 
  useVelocity, 
  useSpring, 
  useTransform, 
  useMotionValue, 
  useAnimationFrame 
} from "framer-motion";

const STRIP_IMAGES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300&auto=format&fit=crop",
];

const THEMES = [
  {
    name: "Classic Monochrome",
    desc: "Nuansa hitam putih abadi dengan kontras yang dramatis. Sempurna untuk ekspresi tegas dan editorial.",
    img: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Tokyo Vintage",
    desc: "Warna analog pudar khas cuci film 90-an. Membawa kembali kenangan hangat yang bernuansa nostalgia.",
    img: "https://images.unsplash.com/photo-1542051842920-c7aa7111c12e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Soft Cinematic",
    desc: "Tonasi pastel hangat yang memberikan kesan dreamy. Sangat lembut dan cocok untuk momen manis berpasangan.",
    img: "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Y2K Pop",
    desc: "Saturasi tinggi dengan sentuhan lo-fi retro 2000-an. Sangat energetik, ceria, dan cocok untuk grup dinamis.",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop"
  }
];

const TEMPLATES = [
  {
    name: "Classic Strip",
    size: "2x6 Inch",
    type: "strip",
    images: STRIP_IMAGES,
    bgColor: "bg-white",
    textColor: "text-[#2C2A29]",
  },
  {
    name: "Postcard Wide",
    size: "4x6 Inch",
    type: "postcard",
    images: ["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop"],
    bgColor: "bg-white",
    textColor: "text-[#2C2A29]",
  },
  {
    name: "Noir Strip",
    size: "2x6 Inch",
    type: "strip",
    images: STRIP_IMAGES.slice().reverse(),
    bgColor: "bg-[#2C2A29]",
    textColor: "text-[#F6F4F0]",
  },
  {
    name: "Quad Grid",
    size: "4x6 Inch",
    type: "grid",
    images: STRIP_IMAGES,
    bgColor: "bg-white",
    textColor: "text-[#2C2A29]",
  },
  {
    name: "Round Pocket",
    size: "3x3 Inch",
    type: "mini",
    images: [THEMES[1].img || "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=300"],
    bgColor: "bg-[#EFEBDE]",
    textColor: "text-[#8B5E56]",
  }
];

const TemplateCard = ({ item }: { item: any }) => {
  return (
    <motion.div 
      initial={{ rotateY: -15, rotateX: 5, scale: 0.9, z: 0 }}
      whileHover={{ rotateY: 0, rotateX: 0, scale: 1.05, z: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className="flex flex-col items-center gap-6 group mx-4 md:mx-8 cursor-pointer relative"
    >      {item.type === "strip" && (
        <div className={`${item.bgColor} w-32 md:w-44 p-2 md:p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col gap-2 border border-[#2C2A29]/10 relative z-10`}>
          {item.images.map((img: string, i: number) => (
            <div key={i} className="aspect-4/3 bg-[#EFEBDE]/80 w-full overflow-hidden flex items-center justify-center relative">
              <Image 
                src={img} 
                alt={`HIKARA Layout Frame - ${item.name} Style ${i + 1}`} 
                fill 
                sizes="(max-width: 768px) 150px, 200px"
                className="object-cover" 
              />
            </div>
          ))}
          <div className="pt-2 flex justify-center items-center">
            <span className={`text-[7px] tracking-[0.4em] font-heading font-medium ${item.textColor}`}>HIKARA</span>
          </div>
        </div>
      )}

      {item.type === "postcard" && (
        <div className={`${item.bgColor} w-64 md:w-96 p-2 md:p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col border border-[#2C2A29]/10 relative z-10`}>
          <div className="aspect-3/2 bg-[#EFEBDE]/80 w-full overflow-hidden relative">
            <Image 
              src={item.images[0]} 
              alt={`HIKARA Layout Frame - ${item.name} Wide Selection`} 
              fill 
              sizes="(max-width: 768px) 300px, 450px"
              className="object-cover" 
            />
          </div>
          <div className="pt-4 pb-1 flex justify-between items-center px-1">
            <span className="text-[7px] tracking-widest text-[#5A5550] uppercase">Premium Print</span>
            <span className={`text-[10px] tracking-[0.3em] font-heading ${item.textColor}`}>HIKARA</span>
          </div>
        </div>
      )}

      {item.type === "grid" && (
        <div className={`${item.bgColor} w-64 md:w-96 p-2 md:p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] grid grid-cols-2 gap-1 border border-[#2C2A29]/10 relative z-10`}>
          {item.images.map((img: string, i: number) => (
            <div key={i} className="aspect-square bg-[#EFEBDE]/80 overflow-hidden relative">
              <Image 
                src={img} 
                alt={`HIKARA Layout Frame - ${item.name} Grid View ${i + 1}`} 
                fill 
                sizes="(max-width: 768px) 150px, 200px"
                className="object-cover" 
              />
            </div>
          ))}
          <div className="col-span-2 pt-3 flex justify-center items-center">
            <span className={`text-[9px] tracking-[0.4em] font-heading ${item.textColor}`}>HIKARA</span>
          </div>
        </div>
      )}

      {item.type === "mini" && (
        <div className={`${item.bgColor} w-44 md:w-60 p-3 md:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col border border-[#2C2A29]/5 relative z-10`}>
          <div className="aspect-square bg-white w-full overflow-hidden relative rounded-full border-4 border-white shadow-inner">
            <Image 
              src={item.images[0]} 
              alt={`HIKARA Layout Frame - ${item.name} Pocket Round Style`} 
              fill 
              sizes="(max-width: 768px) 200px, 300px"
              className="object-cover" 
            />
          </div>
          <div className={`pt-6 pb-2 text-center font-heading text-[11px] tracking-widest ${item.textColor}`}>
            HIKARA STUDIO
          </div>
        </div>
      )}

      <div className="text-center mt-2 shrink-0">
        <h4 className="font-heading text-xl text-[#2C2A29] uppercase tracking-widest mb-1">{item.name}</h4>
        <p className="text-[10px] text-[#5A5550] tracking-widest uppercase">{item.size}</p>
      </div>
    </motion.div>
  );
};

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const SmoothMarquee = ({ children, baseVelocity = 1 }: { children: React.ReactNode, baseVelocity?: number }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], { clamp: false });

  // Memutar antara -25% s.d 0% karena children kita gandakan 4 kali supaya aman (25% per blok)
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);

  const directionFactor = useRef<number>(-1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    const currentVelocity = velocityFactor.get();
    if (currentVelocity < 0) {
      directionFactor.current = 1; // scroll atas -> ke kanan
    } else if (currentVelocity > 0) {
      directionFactor.current = -1; // scroll bawah -> ke kiri
    }

    moveBy += directionFactor.current * moveBy * Math.abs(currentVelocity);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 flex flex-nowrap w-full items-center py-8">
      <motion.div className="flex flex-nowrap items-center w-max" style={{ x }}>
        {children}
      </motion.div>
    </div>
  );
};

export const ThemesSection = () => {
  return (
    <>
      <section id="themes" className="bg-[#F6F4F0] relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        {/* Background Decor Typography */}
        <div className="absolute top-32 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0 opacity-[0.02]">
          <span className="font-heading text-[20vw] md:text-[25vw] leading-none text-[#2C2A29] whitespace-nowrap tracking-tighter mix-blend-multiply">
            FORMAT
          </span>
        </div>

        <div className="flex flex-col justify-center items-center overflow-hidden z-10 w-full relative">
          <FadeUp className="mb-12 md:mb-20 px-6">
            <div className="text-center relative">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-4 font-sans font-medium flex items-center justify-center gap-4">
                Layout Frame
                <span className="font-serif text-[#2C2A29]/50 ml-2 text-[10px] tracking-[0.2em] uppercase">FRAME</span>
              </h2>
              <h3 className="font-heading text-4xl md:text-6xl text-[#2C2A29] relative inline-block z-10">
                Format Cetak Fisik
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 border-b border-[#8B5E56]/40"></div>
              </h3>
            </div>
          </FadeUp>

          <div className="w-full relative py-8 md:py-12 flex items-center perspective-[2000px]">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-r from-[#F6F4F0] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-linear-to-l from-[#F6F4F0] to-transparent z-20 pointer-events-none"></div>
            
            <SmoothMarquee baseVelocity={1}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex shrink-0 items-center justify-around pr-8">
                  {TEMPLATES.map((item, idx) => (
                    <TemplateCard key={idx} item={item} />
                  ))}
                </div>
              ))}
            </SmoothMarquee>
          </div>
        </div>
      </section>

      {/* THEMES (FILTERS) SECTION - Separate Section */}
      <section id="filters" className="max-w-6xl mx-auto px-6 pt-16 md:pt-20 pb-32 md:pb-48 relative z-20 bg-[#F6F4F0]">
        <FadeUp>
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 md:mb-32 gap-6">
             <div>
               <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-4 font-sans font-medium flex items-center gap-4">
                Color Filters
                <span className="font-serif text-[#2C2A29]/50 ml-2 text-[10px] tracking-[0.2em] uppercase">FILTER</span>
              </h2>
              <h3 className="font-heading text-4xl md:text-5xl text-[#2C2A29] tracking-tight">Tema Estetik</h3>
             </div>
             <p className="text-xs md:text-sm text-[#5A5550] max-w-sm uppercase tracking-widest leading-loose">
               Setiap jepretan adalah kanvas. Pilih filter eksklusif yang menyempurnakan mood momen Anda.
             </p>
           </div>
        </FadeUp>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24 md:gap-y-32">
          {THEMES.map((theme, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 md:gap-10 group cursor-pointer items-start">
              <div className="w-full md:w-1/2">
                <ImageMaskReveal 
                  delay={0.1}
                  src={theme.img} 
                  alt={`HIKARA Tema Foto Studio - ${theme.name}`} 
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="aspect-square md:aspect-4/5 bg-[#EFEBDE] w-full shadow-lg rounded-t-full"
                />
              </div>
              <FadeUp delay={0.3} className="w-full md:w-1/2 pt-2 md:pt-12 flex flex-col justify-center">
                <span className="text-[9px] tracking-[0.3em] font-sans text-[#8B5E56] mb-4 uppercase inline-block border border-[#8B5E56]/30 px-3 py-1 rounded-full w-fit">Filter {idx + 1}</span>
                <h3 className="font-heading text-2xl md:text-3xl text-[#2C2A29] mb-4 group-hover:text-[#8B5E56] transition-colors duration-500">{theme.name}</h3>
                <p className="text-sm text-[#5A5550] leading-loose tracking-wide">{theme.desc}</p>
              </FadeUp>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
