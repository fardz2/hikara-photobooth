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
  description:
    "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru. Studio foto berkonsep estetika modern minimalis. Pesan sesi Anda sekarang!",
  keywords: [
    "Photobox Kotabaru",
    "Studio Foto Kotabaru",
    "Photobooth Kotabaru",
    "Photo Studio Kalimantan Selatan",
    "Kotabaru Kalimantan Selatan",
    "Foto Estetik",
    "Modern Minimalist Photo Studio",
    "HIKARA Photobox",
  ],
  authors: [{ name: "HIKARA" }],
  creator: "HIKARA",
  publisher: "HIKARA",
  openGraph: {
    title: "HIKARA Photobox | Studio Foto Premium di Kotabaru",
    description:
      "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru. Berkonsep estetika modern minimalis.",
    url: "https://hikara-photobox.vercel.app",
    siteName: "HIKARA Photobox",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIKARA Photobox | Kotabaru",
    description:
      "Abadikan momen kecil menjadi kenangan abadi di HIKARA Photobox Kotabaru.",
  },
  verification: {
    google: "qjmTk4oz596BvD7Oj8SnqGvG_QEbNLFQiDPEf7zNcoA",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PhotographyBusiness",
    "name": "HIKARA Photobox",
    "image": "https://hikara-photobox.vercel.app/logo.png",
    "@id": "https://hikara-photobox.vercel.app",
    "url": "https://hikara-photobox.vercel.app",
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kotabaru",
      "addressRegion": "Kalimantan Selatan",
      "addressCountry": "ID"
    },
    "description": "Studio foto berkonsep estetika modern minimalis di Kotabaru, Kalimantan Selatan."
  };

  return (
    <html
      lang="id"
      className={cn(
        "relative",
        "h-full",
        "antialiased",
        montserrat.variable,
        playfair.variable,
        "font-sans",
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
