"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { logout } from "@/lib/actions/auth-actions";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/reservations", label: "Reservasi" },
    { href: "/dashboard/pendapatan", label: "Pendapatan" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <HugeiconsIcon icon={Menu01Icon} size={24} className="text-[#2C2A29]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] p-0 border-r border-[#2C2A29]/5">
        <SheetHeader className="px-8 py-8 text-left border-b border-[#2C2A29]/5">
          <SheetTitle>
            <Image src="/logo.png" width={100} height={30} alt="HIKARA" className="h-6 w-auto mix-blend-multiply opacity-90" />
            <p className="text-[8px] tracking-[0.3em] text-[#8B5E56] uppercase mt-1">Panel Admin</p>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col py-6 px-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium transition-colors",
                  isActive
                    ? "bg-[#F6F4F0] text-[#2C2A29] border-l-2 border-[#8B5E56]"
                    : "text-[#5A5550] hover:bg-[#F6F4F0] border-l-2 border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          
          <a
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550] hover:text-[#2C2A29] transition-colors border-t border-[#2C2A29]/5 mt-4"
          >
            Kunjungi Situs
          </a>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#2C2A29]/5 bg-white">
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium text-red-600 hover:bg-red-50 transition-colors">
              Keluar
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
