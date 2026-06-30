"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { uploadSiteImage } from "@/lib/actions/upload-actions";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  name: string;
  label: string;
  defaultValue?: string;
}

export function ImageField({ name, label, defaultValue = "" }: Props) {
  const [url, setUrl] = useState(defaultValue);
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
      const result = await uploadSiteImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setUrl(result.url!);
        setLoaded(false);
        setError(false);
        toast.success("Uploaded");
      }
      if (ref.current) ref.current.value = "";
    });
  };

  const isUrl = /^https?:\/\//.test(url);

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setLoaded(false);
            setError(false);
          }}
          className="flex-1 border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
          placeholder="https://..."
        />
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => ref.current?.click()}
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
      {isUrl && (
        <div className="mt-2 relative w-32 h-20 overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF]">
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5A5550] bg-white/80">
              Invalid URL
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className={`w-full h-full object-cover ${loaded && !error ? "opacity-100" : "opacity-0"} transition-opacity`}
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
          />
        </div>
      )}
    </div>
  );
}
