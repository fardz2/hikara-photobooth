"use client";

import { Add01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/actions/upload-actions";
import { ImagePreview } from "./image-preview";

interface Props {
  name: string;
  label: string;
  defaultValue?: string[];
  max?: number;
}

export function GalleryField({
  name,
  label,
  defaultValue = [],
  max = 3,
}: Props) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [uploading, startUpload] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const filled = items.filter(Boolean).length;
  const canAdd = filled < max;

  const remove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canAdd) return;
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", name);
      const result = await uploadImage(fd);
      if ("error" in result) toast.error(result.error);
      else {
        setItems((prev) => [...prev, result.url]);
        toast.success("Terunggah");
      }
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-2">
        {label}
        <span className="text-[#8B5E56] ml-1">
          ({filled}/{max})
        </span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.filter(Boolean).map((item, idx) => (
          <div key={idx} className="relative">
            <input type="hidden" name={`${name}_${idx}`} value={item} />
            <ImagePreview src={item} onDelete={() => remove(idx)} />
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className="aspect-video border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center hover:border-[#632626] transition-colors text-[#8B5E56] disabled:opacity-50"
          >
            {uploading ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin"
                size={24}
              />
            ) : (
              <>
                <HugeiconsIcon icon={Add01Icon} size={24} />
                <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">
                  Upload Gambar
                </span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
      <input type="hidden" name={`${name}_count`} value={filled} />
    </div>
  );
}
