"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  src: string;
  onDelete?: () => void;
  onReplace?: () => void;
  uploading?: boolean;
}

export function ImagePreview({ src, onDelete, onReplace, uploading }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full aspect-video overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF] group">
      {!loaded && !error && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5A5550] bg-white/80">
          Gagal
        </div>
      )}
      <img
        src={src}
        alt=""
        className={`w-full h-full object-cover ${loaded && !error ? "opacity-100" : "opacity-0"} transition-opacity`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />

      {onReplace && (
        <button
          type="button"
          disabled={uploading}
          onClick={onReplace}
          className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-0"
        >
          <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black/60 px-3 py-1">
            {uploading ? "..." : "Ganti"}
          </span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-1 right-1 size-5 bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
