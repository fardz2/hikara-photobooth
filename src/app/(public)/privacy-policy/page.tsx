import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Hikara Photobox",
  description: "Informasi mengenai bagaimana Hikara Photobox mengumpulkan, menggunakan, dan melindungi data pribadi Anda untuk layanan reservasi photoshoot studio.",
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
      <div className="prose prose-sm max-w-none text-[#5A5550] leading-relaxed space-y-8 pb-12">
        <p className="text-xs italic">Terakhir diperbarui: 02 April 2026</p>
        
        <p>
          Selamat datang di Hikara Photobox. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat Anda menggunakan layanan reservasi photobox kami baik melalui situs web maupun secara langsung di studio kami.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Untuk memberikan layanan terbaik, kami mengumpulkan informasi identitas pribadi (PII) yang Anda berikan secara sukarela melalui formulir reservasi kami. Informasi ini mencakup namun tidak terbatas pada:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Nama Lengkap:</strong> Digunakan untuk identifikasi pesanan dan sapaan personal.</li>
            <li><strong>Nomor WhatsApp:</strong> Media komunikasi utama untuk pengiriman invoice, pengingat jadwal, dan link hasil foto digital.</li>
            <li><strong>Data Transaksi:</strong> Informasi mengenai paket yang dipilih, waktu reservasi, dan status pembayaran.</li>
            <li><strong>Bukti Pembayaran:</strong> Jika Anda melakukan pembayaran melalui transfer, kami menyimpan gambar bukti transfer untuk validasi finansial.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">2. Penggunaan Informasi</h2>
          <p>Informasi yang Anda berikan diproses semata-mata untuk tujuan operasional layanan kami, yaitu:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Memproses dan mengelola jadwal pendaftaran atau reservasi studio Anda.</li>
            <li>Mengirimkan notifikasi real-time melalui integrasi WhatsApp (Fonnte) mengenai status pendaftaran.</li>
            <li>Menyediakan dukungan pelanggan jika terjadi kendala teknis atau perubahan jadwal.</li>
            <li>Menjalankan analisis internal untuk meningkatkan kualitas layanan dan efisiensi operasional studio Hikara.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">3. Penyimpanan dan Keamanan Data</h2>
          <p>
            Keamanan data Anda adalah prioritas utama kami. Kami menggunakan teknologi enkripsi standar industri dan infrastruktur database yang aman melalui Supabase untuk melindungi data Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Data Anda hanya dapat diakses oleh staf administrasi yang berwenang untuk tujuan pemrosesan pesanan.
          </p>
          <p>
            Foto-foto hasil sesi photoshoot Anda disimpan di server kami selama periode terbatas (biasanya 7-30 hari) untuk memungkinkan Anda mengunduh hasil digital. Setelah periode tersebut, kami dapat menghapus data file tersebut untuk menjaga privasi dan kapasitas penyimpanan kami.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">4. Berbagi Informasi dengan Pihak Ketiga</h2>
          <p>
            Hikara Photobox tidak akan menjual, menyewakan, atau menukarkan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran. Kami hanya membagikan informasi terbatas dengan mitra layanan esensial kami, seperti penyedia layanan notifikasi WhatsApp (Fonnte), hanya sejauh yang diperlukan untuk menjalankan fungsi layanan tersebut.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">5. Hak-hak Pengguna</h2>
          <p>Anda memiliki hak untuk mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda dari sistem kami. Jika Anda ingin melakukan hal tersebut, Anda dapat menghubungi kami melalui kontak resmi yang tertera di situs web kami.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-[#2C2A29] uppercase tracking-wider">6. Perubahan Kebijakan</h2>
          <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan perubahan dalam praktik kami atau alasan operasional, hukum, atau peraturan lainnya. Kami menyarankan Anda untuk meninjau halaman ini secara berkala.</p>
        </section>

        <div className="pt-12 border-t border-[#2C2A29]/10">
          <Link href="/" className="text-xs tracking-[0.4em] text-[#8B5E56] font-heading font-bold uppercase hover:text-[#2C2A29] transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
