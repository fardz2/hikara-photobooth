"use client";

import { FadeUp, ImageMaskReveal } from "@/components/ui/motion";

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

export const ThemesSection = () => {
  return (
    <section id="themes" className="py-24 md:py-40 bg-[#F6F4F0] relative overflow-hidden px-6">
      
      {/* Background Decor Typography */}
      <div className="absolute top-32 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0 opacity-[0.02]">
        <span className="font-heading text-[20vw] md:text-[25vw] leading-none text-[#2C2A29] whitespace-nowrap tracking-tighter mix-blend-multiply">
          TEMPLATES
        </span>
      </div>
      <div className="absolute bottom-32 -right-40 overflow-hidden flex justify-center pointer-events-none select-none z-0 opacity-[0.02]">
        <span className="font-heading text-[15vw] leading-none text-[#2C2A29] whitespace-nowrap tracking-tighter rotate-90 mix-blend-multiply">
          FILTERS
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* TEMPLATES (CARD LAYOUTS) SECTION */}
        <FadeUp className="mb-24 md:mb-40">
          <div className="text-center mb-16 md:mb-24 relative">
             <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-4 font-sans font-medium flex items-center justify-center gap-4">
              Frame Layouts
              <span className="font-serif text-[#2C2A29]/50 ml-2 text-[10px] tracking-[0.2em] uppercase">FRAME</span>
            </h2>
            <h3 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#2C2A29] relative inline-block z-10">
              Format Cetak Fisik
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 border-b border-[#8B5E56]/40"></div>
            </h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-20 md:gap-40 mt-12 w-full">
            
            {/* Strip Layout 2x6 */}
            <div className="flex flex-col items-center gap-8 group w-full md:w-auto">
              <div className="relative">
                {/* Decorative background shadow paper */}
                <div className="absolute inset-0 bg-[#EFEBDE]/50 transform translate-x-4 translate-y-4 -rotate-6 border border-[#2C2A29]/5 shadow-sm hidden md:block transition-all duration-700 group-hover:translate-x-6 group-hover:translate-y-6"></div>
                
                <div className="w-32 md:w-40 bg-white p-3 shadow-2xl shadow-[#2C2A29]/10 flex flex-col gap-2 transform transition-all duration-700 group-hover:-translate-y-4 -rotate-3 border border-[#2C2A29]/10 hover:rotate-0 relative z-10">
                  {STRIP_IMAGES.map((img, i) => (
                    <div key={i} className="aspect-4/3 bg-[#EFEBDE]/80 w-full overflow-hidden flex items-center justify-center relative">
                      <img src={img} alt="Strip Pose" className="w-full h-full object-cover filter grayscale opacity-90 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105" />
                    </div>
                  ))}
                  <div className="pt-3 pb-1 flex justify-center items-center gap-2">
                    <span className="w-1/4 h-px bg-[#2C2A29]/20"></span>
                    <span className="text-[8px] tracking-[0.4em] font-heading font-medium text-[#2C2A29]">HIKARA</span>
                    <span className="w-1/4 h-px bg-[#2C2A29]/20"></span>
                  </div>
                </div>
              </div>
              
              <div className="text-center md:max-w-[200px] mt-4">
                <h3 className="font-heading text-xl text-[#2C2A29] uppercase tracking-widest mb-1">Classic Strip</h3>
                <p className="text-[10px] md:text-xs text-[#5A5550] tracking-widest uppercase mb-3">2x6 Inch</p>
                <p className="text-xs text-[#5A5550] leading-relaxed hidden md:block">Format abadi dengan 4 ruang pose vertikal. Ideal untuk disimpan di dompet.</p>
              </div>
            </div>

            {/* Postcard Layout Wide */}
            <div className="flex flex-col items-center gap-8 group mt-16 md:mt-0 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-[#EFEBDE]/50 transform -translate-x-3 translate-y-4 rotate-3 border border-[#2C2A29]/5 shadow-sm hidden md:block transition-all duration-700 group-hover:-translate-x-5 group-hover:translate-y-5"></div>
              
                <div className="w-72 md:w-80 bg-white p-3 py-4 shadow-2xl shadow-[#2C2A29]/10 flex flex-col transform transition-all duration-700 group-hover:-translate-y-4 rotate-2 border border-[#2C2A29]/10 hover:rotate-0 relative z-10">
                  <div className="aspect-3/2 bg-[#EFEBDE]/80 w-full overflow-hidden p-[2px] flex items-center justify-center relative">
                    <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop" alt="Postcard Pose" className="w-full h-full object-cover filter grayscale opacity-90 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105" />
                  </div>
                  <div className="pt-5 pb-2 flex justify-between items-end px-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] tracking-widest font-sans text-[#5A5550] uppercase">Original Quality</span>
                      <span className="w-full h-px bg-[#2C2A29]/20 mt-1"></span>
                    </div>
                    <span className="text-[11px] tracking-[0.4em] font-heading font-medium text-[#2C2A29]">HIKARA</span>
                  </div>
                </div>
              </div>

              <div className="text-center md:max-w-[240px] mt-4">
                <h3 className="font-heading text-xl text-[#2C2A29] uppercase tracking-widest mb-1">Postcard Wide</h3>
                <p className="text-[10px] md:text-xs text-[#5A5550] tracking-widest uppercase mb-3">4x6 Inch</p>
                <p className="text-xs text-[#5A5550] leading-relaxed hidden md:block">Kanvas lebih lebar untuk grup besar, dengan opsi 1 foto utuh atau grid.</p>
              </div>
            </div>

          </div>
        </FadeUp>

        {/* THEMES (FILTERS) SECTION */}
        <div className="pt-24 md:pt-40 border-t border-[#2C2A29]/10 relative z-10">
          <FadeUp>
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-6">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-16 md:gap-y-24">
            {THEMES.map((theme, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 md:gap-8 group cursor-pointer items-start">
                <div className="w-full md:w-1/2">
                  <ImageMaskReveal 
                    delay={0.1}
                    src={theme.img} 
                    alt={theme.name} 
                    className="aspect-square md:aspect-4/5 bg-[#EFEBDE] w-full shadow-lg"
                  />
                </div>
                <FadeUp delay={0.3} className="w-full md:w-1/2 pt-2 md:pt-10 flex flex-col justify-center">
                  <span className="text-[9px] tracking-[0.3em] font-sans text-[#8B5E56] mb-4 uppercase inline-block border border-[#8B5E56]/30 px-3 py-1 rounded-full w-fit">Filter {idx + 1}</span>
                  <h3 className="font-heading text-2xl md:text-3xl text-[#2C2A29] mb-4 group-hover:text-[#8B5E56] transition-colors duration-500">{theme.name}</h3>
                  <p className="text-sm text-[#5A5550] leading-loose tracking-wide">{theme.desc}</p>
                </FadeUp>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
