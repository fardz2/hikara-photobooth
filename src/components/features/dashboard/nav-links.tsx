"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/reservations", label: "Reservasi" },
  { href: "/dashboard/pendapatan", label: "Pendapatan" },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium transition-colors",
              isActive 
                ? "bg-[#F6F4F0] text-[#2C2A29] border-l-2 border-[#8B5E56]" 
                : "text-[#5A5550] hover:bg-[#F6F4F0] hover:text-[#2C2A29] border-l-2 border-transparent"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      
      <a
        href="/"
        className="flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550] hover:text-[#2C2A29] transition-colors border-t border-[#2C2A29]/5 mt-4"
      >
        Kunjungi Situs
      </a>
    </nav>
  );
};
