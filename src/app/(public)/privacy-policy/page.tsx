import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hikara Photobox",
  description: "Privacy policy for Hikara Photobox customers.",
};

export default function PrivacyPolicyPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://hikara-photobox.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://hikara-photobox.vercel.app/privacy-policy"
      }
    ]
  };

  return (
    <div className="pt-32 md:pt-48 pb-24 px-6 max-w-3xl mx-auto flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        key="breadcrumb-json"
      />
      <h1 className="font-heading text-4xl text-[#2C2A29] tracking-tight uppercase">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-[#5A5550] leading-relaxed space-y-6">
        <p>Terakhir diperbarui: 30 Maret 2026</p>
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#2C2A29]">1. Informasi yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan informasi yang Anda berikan saat melakukan reservasi, termasuk nama dan nomor WhatsApp.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#2C2A29]">2. Penggunaan Informasi</h2>
          <p>Informasi Anda digunakan semata-mata untuk mengelola reservasi dan mengirimkan konfirmasi melalui WhatsApp.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#2C2A29]">3. Keamanan Data</h2>
          <p>Kami menjaga keamanan data Anda dan tidak akan membagikannya kepada pihak ketiga tanpa izin Anda.</p>
        </section>
      </div>
    </div>
  );
}
