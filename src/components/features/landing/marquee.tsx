import { InfiniteMarquee } from "@/components/ui/motion";

export const Marquee = () => {
  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-[#2C2A29]/10 py-6 flex items-center bg-[#EFEBDE]/50">
      <InfiniteMarquee className="flex gap-16 text-[#2C2A29]/40 text-xs md:text-sm tracking-[0.4em] font-medium uppercase font-heading min-w-max">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="flex items-center gap-16">
            <span>HIKARA PHOTOBOX</span>
            <span className="font-serif text-sm tracking-widest uppercase">MEMORIES</span>
            <span>STUDIO QUALITY</span>
            <span className="font-serif text-sm tracking-widest uppercase">LIGHT</span>
          </span>
        ))}
      </InfiniteMarquee>
    </div>
  );
};
