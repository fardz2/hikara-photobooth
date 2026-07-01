"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { replaceImage, uploadImage } from "@/lib/actions/upload-actions";
import { ImagePreview } from "./image-preview";

interface Props {
  name: string;
  label?: string;
  defaultValue?: string;
}

export function ImageField({ name, label, defaultValue }: Props) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, startUpload] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  const pick = () => ref.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", name);
      const r = url ? await replaceImage(url, fd) : await uploadImage(fd);
      if ("error" in r) toast.error(r.error);
      else { setUrl(r.url); toast.success("Gambar terunggah"); }
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div>
      {label && <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">{label}</label>}
      <input type="hidden" name={name} value={url} />
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      {url ? (
        <ImagePreview src={url} onDelete={() => setUrl("")} onReplace={pick} uploading={uploading} />
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={pick}
          className="w-full aspect-video border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center cursor-pointer hover:border-[#632626] transition-colors text-[#8B5E56] disabled:opacity-50"
        >
          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v12" />
          </svg>
          <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">Pilih Gambar</span>
        </button>
      )}
    </div>
  );
}
