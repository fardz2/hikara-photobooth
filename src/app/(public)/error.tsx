"use client";

export default function PublicError({
  _error,
  reset,
}: {
  _error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F4F0] px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-heading text-6xl text-[#2C2A29] mb-4">Oops!</h1>
        <p className="text-[#5A5550] text-sm tracking-widest uppercase mb-8">
          Terjadi kesalahan. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="bg-[#2C2A29] text-[#F6F4F0] px-8 py-4 text-xs tracking-[0.3em] uppercase font-medium hover:bg-[#8B5E56] transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
