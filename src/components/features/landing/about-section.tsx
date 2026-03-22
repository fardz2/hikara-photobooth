"use client";

import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-24 md:py-40 flex flex-col items-center justify-center text-center px-6 bg-transparent relative overflow-hidden"
    >
      {/* Decorative Background */}
      <div className="absolute top-1/2 -translate-y-1/2 text-[#2C2A29] opacity-[0.02] font-heading text-[25vw] leading-none pointer-events-none whitespace-nowrap z-0 tracking-tighter mix-blend-multiply">
        ABOUT US
      </div>
      <div className="absolute left-6 md:left-24 top-24 md:top-40 hidden lg:block opacity-[0.15] z-0">
         <span className="font-serif text-4xl text-[#8B5E56] tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl' }}>VISION</span>
      </div>
      <div className="absolute right-6 md:right-24 bottom-24 hidden lg:block opacity-[0.15] z-0">
         <span className="font-sans text-[10px] tracking-[0.5em] text-[#2C2A29] uppercase border-l border-[#8B5E56] pl-4">HIKARA STUDIO</span>
      </div>

      <FadeUp className="relative z-10 w-full">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#8B5E56] mb-4 font-sans font-medium flex items-center gap-4">
          <span className="w-8 h-px bg-[#8B5E56]"></span>
          Tentang Kami
          <span className="font-serif text-[#2C2A29]/50 ml-2">
            ABOUT US
          </span>
          <span className="w-8 h-px bg-[#8B5E56]"></span>
        </h2>
      </FadeUp>

      <FadeUp delay={0.2} className="w-full">
        <p className="font-heading text-2xl md:text-4xl text-[#2C2A29] max-w-3xl leading-relaxed my-12 mx-auto">
          Kami menciptakan ruang sederhana untuk menangkap momen yang jujur dan
          apa adanya.
          <span className="block mt-6 text-sm font-sans font-light tracking-widest text-[#5A5550] uppercase leading-loose">
            Desain elegan, pencahayaan presisi, dan estetika majalah dalam
            setiap cetakan.
          </span>
        </p>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16 max-w-6xl mx-auto w-full border-t border-[#2C2A29]/10 pt-16 h-auto md:h-[500px]">
        {/* Bento Cell 1: Large Image/Title Span 2 */}
        <StaggerItem className="col-span-1 md:col-span-2 row-span-2 bg-[#EFEBDE]/50 border border-[#2C2A29]/5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group text-left">
           <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000" alt="Process" />
             <div className="absolute inset-0 bg-linear-to-t from-[#F6F4F0] via-[#F6F4F0]/80 to-transparent"></div>
           </div>
           <span className="font-serif text-8xl md:text-9xl text-[#8B5E56] opacity-30 relative z-10 mix-blend-multiply">H</span>
           <div className="relative z-10 mt-24">
             <h4 className="text-sm md:text-base tracking-[0.3em] uppercase text-[#2C2A29] font-heading font-bold mb-4">Filosofi Eksklusif</h4>
             <p className="text-xs leading-loose tracking-widest text-[#5A5550] max-w-sm uppercase">Ruang privat untuk berekspresi tanpa batas dengan sistem lighting level komersial.</p>
           </div>
        </StaggerItem>

        <StaggerItem className="col-span-1 border border-[#2C2A29]/10 p-8 flex flex-col justify-center items-start text-left bg-white shadow-2xl shadow-[#2C2A29]/5 group hover:border-[#8B5E56]/50 transition-colors">
          <span className="text-[10px] tracking-[0.3em] font-medium text-[#8B5E56] mb-4 uppercase">Langkah 01</span>
          <h4 className="font-heading text-xl text-[#2C2A29] mb-2 group-hover:text-[#8B5E56] transition-colors">Reservasi Studio</h4>
          <p className="text-xs text-[#5A5550] leading-relaxed">Booking waktu spesifik untuk memastikan zero-waiting time dan kenyamanan.</p>
        </StaggerItem>

        <StaggerItem className="col-span-1 border border-[#2C2A29]/10 p-8 flex flex-col justify-center items-start text-left bg-white shadow-2xl shadow-[#2C2A29]/5 group hover:border-[#8B5E56]/50 transition-colors">
          <span className="text-[10px] tracking-[0.3em] font-medium text-[#8B5E56] mb-4 uppercase">Langkah 02</span>
          <h4 className="font-heading text-xl text-[#2C2A29] mb-2 group-hover:text-[#8B5E56] transition-colors">Premium Print</h4>
          <p className="text-xs text-[#5A5550] leading-relaxed">Terima foto cetak fisik berkelas editorial majalah.</p>
        </StaggerItem>
      </StaggerContainer>
    </section>
  );
};
