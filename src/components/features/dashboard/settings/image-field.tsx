"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { uploadSiteImage } from "@/lib/actions/upload-actions";

interface ImageFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
}

export function ImageField({ name, label, defaultValue }: ImageFieldProps) {
  const [url, setUrl] = useState(defaultValue || "");
  const [preview, setPreview] = useState(defaultValue || "");
  const [uploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSiteImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setUrl(result.url!);
        setPreview(result.url!);
        toast.success("Image uploaded");
      }
    });
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setPreview(e.target.value);
          }}
          placeholder="URL gambar..."
          className="flex-1 border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
        />
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
          className="shrink-0 bg-[#632626] text-white px-3 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {uploading ? (
            <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={12} />
          ) : (
            <HugeiconsIcon icon={Image01Icon} size={12} />
          )}
          Upload
        </button>
      </div>
      {preview && (
        <div className="mt-2 border border-[#2C2A29]/10 overflow-hidden w-32 h-20 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
            onError={() => setPreview("")}
          />
        </div>
      )}
    </div>
  );
}
