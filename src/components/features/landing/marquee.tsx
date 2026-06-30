import { InfiniteMarquee } from "@/components/ui/motion";

interface Props {
  text: string[];
}

export const Marquee = ({ text }: Props) => {
  // Expects text array in groups of 4: [plain, serif, plain, serif]
  return (
    <div className="overflow-hidden whitespace-nowrap border-y border-[#2C2A29]/10 py-6 flex items-center bg-[#EFEBDE]/50">
      <InfiniteMarquee className="flex gap-16 text-[#2C2A29]/40 text-xs md:text-sm tracking-[0.4em] font-medium uppercase font-heading min-w-max">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="flex items-center gap-16">
            {text.map((t, j) => (
              j % 2 === 1
                ? <span key={j} className="font-serif text-sm tracking-widest uppercase">{t}</span>
                : <span key={j}>{t}</span>
            ))}
          </span>
        ))}
      </InfiniteMarquee>
    </div>
  );
};
