"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Image01Icon } from "@hugeicons/core-free-icons";
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

  const handleRemove = () => {
    setCurrentUrl("");
    setLoaded(false);
    setError(false);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input type="hidden" name={name} value={currentUrl} />
        {currentUrl ? (
          <>
            <div className="relative w-32 h-20 overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF]">
              {!loaded && !error && <Skeleton className="absolute inset-0 w-full h-full rounded-none" />}
              {error && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5A5550] bg-white/80">Gagal</div>}
              <img
                src={currentUrl}
                alt=""
                className={`w-full h-full object-cover ${loaded && !error ? "opacity-100" : "opacity-0"} transition-opacity`}
                onLoad={() => setLoaded(true)}
                onError={() => { setError(true); setLoaded(true); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Button type="button" size="xs" variant="outline" disabled={uploading} onClick={() => ref.current?.click()} className="rounded-none border-[#E8E2D9] text-[10px]">
                {uploading ? "..." : "Ganti"}
              </Button>
              <Button type="button" size="xs" variant="destructive" onClick={handleRemove} className="rounded-none text-[10px]">
                Hapus
              </Button>
            </div>
          </>
        ) : (
          <div
            onClick={() => ref.current?.click()}
            className="w-32 h-20 border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center cursor-pointer hover:border-[#632626] transition-colors text-[#8B5E56]"
          >
            {uploading ? (
              <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={20} />
            ) : (
              <>
                <HugeiconsIcon icon={Image01Icon} size={20} />
                <span className="text-[9px] uppercase tracking-widest mt-1 font-bold">Upload</span>
              </>
            )}
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
    </div>
  );
}
