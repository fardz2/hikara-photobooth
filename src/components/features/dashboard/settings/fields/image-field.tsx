"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { replaceImage, uploadImage } from "@/lib/actions/upload-actions";

interface Props {
  name: string;
  label: string;
  defaultValue?: string;
}

export function ImageField({ name, label, defaultValue }: Props) {
  const [currentUrl, setCurrentUrl] = useState(defaultValue || "");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [uploading, startUpload] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", name);

      const result = currentUrl
        ? await replaceImage(currentUrl, fd)
        : await uploadImage(fd);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        setCurrentUrl(result.url);
        setLoaded(false);
        setError(false);
        toast.success("Gambar terunggah");
      }
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">{label}</label>
      <input type="hidden" name={name} value={currentUrl} />
      {currentUrl ? (
        <div className="relative w-full max-w-64 aspect-[3/2] overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF] group">
          {!loaded && !error && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
          {error && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5A5550] bg-white/80">Gagal</div>}
          <img
            src={currentUrl}
            alt=""
            className={`w-full h-full object-cover ${loaded && !error ? "opacity-100" : "opacity-0"} transition-opacity`}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
          />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
          >
            <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black/60 px-3 py-1">
              {uploading ? "..." : "Ganti"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentUrl("")}
            className="absolute top-1 right-1 size-5 bg-black/50 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          className="w-full max-w-64 aspect-[3/2] border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center cursor-pointer hover:border-[#632626] transition-colors text-[#8B5E56]"
        >
          {uploading ? (
            <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={24} />
          ) : (
            <>
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v12" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">Pilih Gambar</span>
            </>
          )}
        </div>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
    </div>
  );
}
