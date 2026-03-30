import { logout } from "@/lib/actions/auth-actions";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { UserEmailDisplay, UserAvatar } from "@/components/features/dashboard/user-info";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNav } from "@/components/features/dashboard/mobile-nav";
import { NavLinks } from "@/components/features/dashboard/nav-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#F6F4F0]/30 text-[#2C2A29] overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#2C2A29]/5 z-30 flex-col pt-8 shrink-0 h-full sticky top-0 overflow-y-auto">
        <div className="px-8 mb-12">
           <Image src="/logo.png" width={120} height={36} alt="HIKARA" className="h-8 w-auto mix-blend-multiply opacity-90" />
           <p className="text-[9px] tracking-[0.3em] text-[#8B5E56] uppercase mt-2 font-medium">Panel Admin</p>
        </div>

        <NavLinks />

        <div className="p-4 border-t border-[#2C2A29]/5">
          <div className="px-4 py-4 mb-2">
            <Suspense fallback={<Skeleton className="h-3 w-28 opacity-20" />}>
              <UserEmailDisplay />
            </Suspense>
          </div>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-4 py-4 text-[10px] tracking-[0.2em] uppercase font-medium text-red-600 hover:bg-red-50 transition-colors">
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">
        {/* Desktop Header & Mobile Header Wrapper */}
        <header className="h-20 bg-white border-b border-[#2C2A29]/5 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
           <div className="flex items-center gap-4">
              <MobileNav />
              <h2 className="text-[10px] tracking-[0.4em] uppercase font-medium text-[#8B5E56] hidden sm:block">Sistem Manajemen Hikara</h2>
              <Image src="/logo.png" width={80} height={24} alt="HIKARA" className="h-6 w-auto mix-blend-multiply opacity-90 md:hidden" />
           </div>

           <div className="flex items-center gap-4">
              <Suspense fallback={<Skeleton className="w-8 h-8 rounded-full opacity-20" />}>
                <UserAvatar />
              </Suspense>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
