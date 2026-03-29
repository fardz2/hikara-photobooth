"use client";

import { useTransition, useState } from "react";
import { login } from "@/lib/actions/auth-actions";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon, Loading03Icon } from "@hugeicons/core-free-icons";

const LoginSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter").min(1, "Password wajib diisi"),
});

type LoginValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md z-10"
    >
      <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#2C2A29]/5 relative overflow-hidden">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-10">
           <Image src="/logo.png" width={140} height={42} alt="HIKARA" className="h-8 md:h-10 w-auto mix-blend-multiply opacity-90 mb-6" />
           <div className="w-12 h-px bg-[#8B5E56]/30 mb-6"></div>
           <h1 className="font-heading text-2xl text-[#2C2A29] tracking-tight text-center uppercase">Akses Admin</h1>
           <p className="text-[10px] tracking-[0.3em] text-[#8B5E56] uppercase mt-2">Kelola Produk & Reservasi</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550]">Email</label>
            <Input 
              {...register("email")}
              type="email" 
              placeholder="masukkan email anda"
              className="bg-[#F6F4F0] border-none px-6 py-6 text-sm h-14 rounded-none focus-visible:ring-[#8B5E56]"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 uppercase tracking-tighter mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550]">Password</label>
            <InputGroup className="bg-[#F6F4F0]">
              <Input 
                {...register("password")}
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="bg-transparent border-[#2C2A29]/20 border-r-0 px-6 py-6 text-sm h-14 rounded-none focus-visible:ring-0 focus-visible:border-[#8B5E56] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center px-4 border border-l-0 border-[#2C2A29]/20 text-[#5A5550]/40 hover:text-[#8B5E56] transition-colors bg-transparent group-focus-within:border-[#8B5E56]"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                <HugeiconsIcon 
                  icon={showPassword ? ViewOffSlashIcon : ViewIcon} 
                  strokeWidth={2} 
                  className="size-5" 
                />
              </button>
            </InputGroup>
            {errors.password && (
              <p className="text-[10px] text-red-500 uppercase tracking-tighter mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            disabled={isPending}
            className="w-full bg-[#2C2A29] text-[#F6F4F0] py-5 text-xs font-medium tracking-[0.3em] uppercase transition-all hover:bg-[#3A3532] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-3"
          >
            {isPending ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin text-[#F6F4F0]" />
                <span>Memproses...</span>
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] tracking-widest text-[#5A5550]/60 uppercase">
            Hikara Photobooth &copy; 2026
          </p>
        </div>
      </div>
    </motion.div>

  );
};
