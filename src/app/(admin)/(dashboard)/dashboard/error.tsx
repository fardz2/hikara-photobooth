"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <div className="text-center space-y-3">
        <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-[#5A5550] max-w-md">
          {error.message || "Halaman tidak dapat dimuat. Silakan coba lagi."}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}
