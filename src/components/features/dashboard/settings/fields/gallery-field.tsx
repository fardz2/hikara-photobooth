"use client";

import { useState, useRef, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { uploadImage } from "@/lib/actions/upload-actions";

interface Props {
  name: string;
  label: string;
  defaultValue?: string[];
  max?: number;
}

export function GalleryField({ name, label, defaultValue = [], max = 3 }: Props) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [uploading, startUpload] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const filled = items.filter((u) => u.trim()).length;
  const canAdd = filled < max;

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canAdd) return;
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", name);
      const result = await uploadImage(fd);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        const next = [...items];
        const emptyIdx = items.findIndex((u) => !u.trim());
        if (emptyIdx >= 0) next[emptyIdx] = result.url;
        else next.push(result.url);
        setItems(next);
        toast.success("Terunggah");
      }
      if (ref.current) ref.current.value = "";
    });
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-2">
        {label}
        <span className="text-[#8B5E56] ml-1">({filled}/{max})</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.filter(Boolean).map((item, idx) => (
          <div key={idx} className="relative group">
            <input type="hidden" name={`${name}_${idx}`} value={item} />
            <div className="relative aspect-square overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF]">
              <img src={item} alt="" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
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
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      <input type="hidden" name={`${name}_count`} value={filled} />
    </div>
  );
}
