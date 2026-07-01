"use client";

import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { replaceImage, uploadImage } from "@/lib/actions/upload-actions";
import { ImagePreview } from "./image-preview";

interface ObjectFieldConfig {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "select";
  options?: { value: string; label: string }[];
}

interface Props {
  name: string;
  label: string;
  defaultValue?: Record<string, unknown>[];
  fields: ObjectFieldConfig[];
}

export function ObjectListField({
  name,
  label,
  defaultValue = [],
  fields,
}: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>(defaultValue);
  const [uploading, startUpload] = useTransition();
  const uploadRef = useRef<{ idx: number; key: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (idx: number, key: string, val: unknown) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  const add = () => {
    const blank: Record<string, unknown> = {};
    for (const f of fields) blank[f.key] = "";
    setItems((prev) => [...prev, blank]);
  };

  const remove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const pickImage = (idx: number, key: string) => {
    uploadRef.current = { idx, key };
    fileRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = uploadRef.current;
    if (!file || !target) return;
    const { idx, key } = target;
    const old = (items[idx]?.[key] as string) || "";
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", `${name}_${key}`);
      const r = old ? await replaceImage(old, fd) : await uploadImage(fd);
      if ("error" in r) toast.error(r.error);
      else {
        update(idx, key, r.url);
        toast.success("Gambar terunggah");
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  const _hasImage = fields.some((f) => f.type === "image");

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {label}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {/* Grid 2-col desktop, 1-col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-[#2C2A29]/10 p-4 space-y-3 bg-white relative group"
          >
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-2 right-2 text-[#8B5E56] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
                  {f.label}
                </label>
                {f.type === "image" ? (
                  <div className="mt-1">
                    {item[f.key] ? (
                      <ImagePreview
                        src={item[f.key] as string}
                        onDelete={() => update(idx, f.key, "")}
                        onReplace={() => pickImage(idx, f.key)}
                        uploading={uploading}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => pickImage(idx, f.key)}
                        className="w-full aspect-video border-2 border-dashed border-[#E8E2D9] flex flex-col items-center justify-center cursor-pointer hover:border-[#632626] transition-colors text-[#8B5E56] disabled:opacity-50"
                      >
                        <HugeiconsIcon icon={Add01Icon} size={20} />
                        <span className="text-[9px] uppercase tracking-widest mt-1 font-bold">
                          Pilih Gambar
                        </span>
                      </button>
                    )}
                  </div>
                ) : f.type === "select" ? (
                  <select
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                    className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white h-9"
                  >
                    <option value="">Pilih...</option>
                    {f.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                    rows={3}
                    className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white resize-y"
                  />
                ) : (
                  <input
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => update(idx, f.key, e.target.value)}
                    className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={add}
          className="border-2 border-dashed border-[#E8E2D9] min-h-[120px] flex flex-col items-center justify-center hover:border-[#632626] hover:text-[#632626] transition-colors text-[#8B5E56] gap-1"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} />
          <span className="text-[9px] uppercase tracking-widest font-bold">
            Tambah Item
          </span>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
