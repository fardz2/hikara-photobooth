import { LoginForm } from "@/components/features/auth/login-form";
import { NoiseOverlay } from "@/components/ui/noise-overlay";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F6F4F0] flex items-center justify-center p-6 relative overflow-hidden">
      <NoiseOverlay />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#8B5E56]/20"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#8B5E56]/5 rounded-full blur-3xl -mr-32 -mb-32"></div>

      <LoginForm />
    </div>
  );
}
