import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "HIKARA Photobox | Studio Foto Premium & Estetik di Kotabaru",
  description: "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru. Studio foto berkonsep Japanese Zen minimalis. Pesan sesi Anda sekarang!",
  keywords: ["Photobox Kotabaru", "Studio Foto Kotabaru", "Foto Estetik", "Japanese Minimalist Photo Studio", "HIKARA Photobox"],
  authors: [{ name: "HIKARA" }],
  creator: "HIKARA",
  publisher: "HIKARA",
  openGraph: {
    title: "HIKARA Photobox | Studio Foto Premium di Kotabaru",
    description: "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru. Berkonsep Japanese Zen minimalis.",
    url: "https://hikara.co",
    siteName: "HIKARA Photobox",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIKARA Photobox | Kotabaru",
    description: "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("relative", "h-full", "antialiased", montserrat.variable, playfair.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
