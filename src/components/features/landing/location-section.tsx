"use client";

import { FadeUp } from "@/components/ui/motion";

export const LocationSection = () => {
  return (
    <section
      id="location"
      className="py-24 md:py-32 flex flex-col items-center justify-center px-6 bg-[#F6F4F0] relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute bottom-0 right-[-5%] text-[#2C2A29] opacity-[0.03] font-heading text-[25vw] leading-none pointer-events-none whitespace-nowrap z-0 tracking-tighter mix-blend-multiply">
        STUDIO
      </div>
      <div className="absolute top-24 left-6 md:left-24 z-0 opacity-[0.1]">
         <span className="font-serif text-4xl text-[#8B5E56] tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl' }}>STUDIO</span>
      </div>
      <FadeUp>
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-12 font-sans font-medium flex items-center justify-center gap-4 relative z-10">
          <span className="w-8 h-px bg-[#8B5E56]"></span>
          Lokasi Studio
          <span className="font-serif text-[#2C2A29]/50 ml-2">
            STUDIO LOCATION
          </span>
          <span className="w-8 h-px bg-[#8B5E56]"></span>
        </h2>
      </FadeUp>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <FadeUp delay={0.1}>
          <p className="font-heading text-3xl md:text-5xl text-[#2C2A29] mb-4 text-center">
            Jl. Veteran,{" "}
            <span className="text-[#8B5E56] font-serif italic">Dirgahayu</span>
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="font-light tracking-[0.15em] text-[#5A5550] text-xs md:text-sm mb-16 uppercase text-center max-w-xl leading-relaxed">
            Kec. Pulau Laut Utara, Kab. Kotabaru <br /> Kalimantan Selatan 72111
          </p>
        </FadeUp>

        <FadeUp delay={0.3} className="w-full">
          <div className="w-full aspect-square md:aspect-21/9 bg-[#EFEBDE]/30 relative group overflow-hidden border border-[#2C2A29]/10 p-2 md:p-4">
            <div className="w-full h-full relative overflow-hidden bg-[#EFEBDE]">
              <iframe
                src="https://maps.google.com/maps?q=Hikara.photobox%2C%20Jl.%20Veteran%2C%20Dirgahayu%2C%20Kec.%20Pulau%20Laut%20Utara%2C%20Kab.%20Kotabaru%2C%20Kalimantan%20Selatan%2072111&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter: "grayscale(100%) contrast(1.1) opacity(0.8)",
                }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-1000 ease-out group-hover:filter-none absolute inset-0"
              ></iframe>
              <div className="absolute inset-0 bg-transparent border border-[#2C2A29]/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none mix-blend-overlay"></div>
            </div>
            {/* Architectural Border Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#2C2A29]/30 pointer-events-none transition-transform duration-700 group-hover:-translate-x-1 group-hover:-translate-y-1"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#2C2A29]/30 pointer-events-none transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#2C2A29]/30 pointer-events-none transition-transform duration-700 group-hover:-translate-x-1 group-hover:translate-y-1"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#2C2A29]/30 pointer-events-none transition-transform duration-700 group-hover:translate-x-1 group-hover:translate-y-1"></div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
};
