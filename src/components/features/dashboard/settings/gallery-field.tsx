"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Image01Icon, Cancel01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { uploadSiteImage } from "@/lib/actions/upload-actions";

interface GalleryFieldProps {
  name: string;
  label: string;
  defaultValue?: string[];
  maxImages?: number;
}

export function GalleryField({ name, label, defaultValue = [], maxImages = 3 }: GalleryFieldProps) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [uploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= maxImages) {
      toast.error(`Max ${maxImages} gambar`);
      return;
    }
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSiteImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setImages((prev) => [...prev, result.url!]);
        toast.success("Image uploaded");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const remove = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
        {label} <span className="text-[#8B5E56]">({images.length}/{maxImages})</span>
      </label>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative border border-[#2C2A29]/10 overflow-hidden aspect-square group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 size-6 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center aspect-square hover:border-[#632626] transition-colors text-[#8B5E56] disabled:opacity-50"
            >
              {uploading ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={20} />
              ) : (
                <>
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                  <span className="text-[9px] uppercase tracking-widest mt-1 font-bold">Upload</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
