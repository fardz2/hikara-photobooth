import { NoiseOverlay } from "@/components/ui/noise-overlay";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F4F0] text-[#3A3532] font-sans selection:bg-[#8B5E56] selection:text-[#F6F4F0] relative overflow-hidden">
      <NoiseOverlay />
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
