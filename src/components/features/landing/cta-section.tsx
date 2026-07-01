import Link from "next/link";
import { Magnetic } from "@/components/ui/magnetic";
import { FadeUp } from "@/components/ui/motion";

interface Props {
  data: Record<string, any> | null;
}

export const CtaSection = ({ data }: Props) => {
  const d: Record<string, any> = {
    title: "SIAP MENGABADIKAN MOMEN?",
    description: "",
    button_text: "Reserve Now",
    button_link: "/reservasi",
    ...data,
  };
  return (
    <section className="py-32 md:py-48 flex flex-col items-center justify-center text-center px-6 bg-[#EFEBDE]/30 relative overflow-hidden border-t border-[#2C2A29]/5">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#2C2A29] opacity-[0.03] font-heading text-[25vw] md:text-[30vw] leading-none pointer-events-none whitespace-nowrap z-0 mix-blend-multiply">
        RESERVASI
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-16 bg-[#2C2A29]/20 z-0"></div>

      <FadeUp className="relative z-10 w-full flex flex-col items-center">
        <h2 className="font-heading text-4xl md:text-6xl text-[#2C2A29] mb-6 md:mb-12 max-w-3xl leading-tight">
          {d.title}
        </h2>
        {d.description && (
          <p className="text-sm md:text-base text-[#5A5550] max-w-lg mb-8 tracking-widest uppercase font-light">
            {d.description}
          </p>
        )}
      </FadeUp>
      <FadeUp delay={0.2} className="relative z-10">
        <Magnetic intensity={0.1}>
          <div className="relative group mt-4">
            <div className="absolute inset-0 bg-[#8B5E56] translate-x-2 translate-y-2 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"></div>
            <Link
              href={d.button_link}
              className="relative block bg-[#2C2A29] text-[#F6F4F0] transition-colors duration-500 text-xs md:text-sm font-medium tracking-[0.3em] uppercase px-12 py-6 border border-[#2C2A29]"
            >
              {d.button_text}
            </Link>
          </div>
        </Magnetic>
      </FadeUp>
      <FadeUp delay={0.4} className="relative z-10 mt-16 md:mt-20">
        <p className="font-serif text-[#8B5E56] text-xl md:text-2xl opacity-80 uppercase tracking-[0.5em] ml-[0.5em]">
          Hikara
        </p>
      </FadeUp>
    </section>
  );
};
