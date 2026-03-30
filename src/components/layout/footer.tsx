import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

export const Footer = async () => {
  await connection();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-full flex flex-col justify-end py-12 text-center bg-[#F6F4F0] relative z-0">
      <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-10">
        <div>
          <Image
            src="/logo.png"
            width={160}
            height={48}
            alt="HIKARA"
            className="h-16 md:h-20 w-auto mix-blend-multiply opacity-80"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#5A5550] font-medium">
          <a
            href="https://www.instagram.com/hikara.photobox"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/6285652046716?text=Halo%20Hikara%2C%20saya%20ingin%20tanya-tanya%20mengenai%20layanan%20photobox-nya."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto"
          >
            WhatsApp
          </a>
          <a
            href="https://www.tiktok.com/@hikara.photobooth"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto"
          >
            TikTok
          </a>
          <a
            href="https://maps.google.com/maps?q=Hikara.photobox%2C%20Jl.%20Veteran%2C%20Dirgahayu%2C%20Kec.%20Pulau%20Laut%20Utara%2C%20Kab.%20Kotabaru%2C%20Kalimantan%20Selatan%2072111"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto"
          >
            Lokasi Studio
          </a>
          <Link
            href="/privacy-policy"
            className="hover:text-[#8B5E56] hover:-translate-y-1 transition-all duration-300 pointer-events-auto"
          >
            Privacy Policy
          </Link>
        </div>

        <div className="w-full max-w-sm h-px bg-[#2C2A29]/10 my-4"></div>

        <div>
          <p className="text-[10px] md:text-xs text-[#5A5550] font-heading tracking-widest uppercase mb-4">
            Kotabaru, Kalimantan Selatan
          </p>
          <p className="text-[9px] md:text-[10px] text-[#5A5550]/60 tracking-[0.2em] uppercase max-w-xs leading-loose mx-auto">
            &copy; {currentYear} Hikara Photobox. <br />
            Minimalist Photo Experience. All Rights Reserved.
          </p>
          <p className="text-[8px] text-[#5A5550]/40 uppercase tracking-widest mt-4">
            Terakhir diperbarui: 30 Maret 2026
          </p>
        </div>
      </div>
    </footer>
  );
};
