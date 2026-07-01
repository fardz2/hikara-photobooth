"use client";

import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
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
  /** Field name to group items by (e.g. "category"). Enables grouped rendering. */
  categoryKey?: string;
}

function renderFieldInput(
  f: ObjectFieldConfig,
  item: Record<string, unknown>,
  idx: number,
  update: (idx: number, key: string, val: unknown) => void,
  pickImage: (idx: number, key: string) => void,
  uploading: boolean,
) {
  if (f.type === "image") {
    return (
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
    );
  }

  if (f.type === "select") {
    return (
      <select
        value={String(item[f.key] ?? "")}
        onChange={(e) => update(idx, f.key, e.target.value)}
        className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white h-9"
      >
        <option value="">Pilih...</option>
        {f.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (f.type === "textarea") {
    return (
      <textarea
        value={String(item[f.key] ?? "")}
        onChange={(e) => update(idx, f.key, e.target.value)}
        rows={3}
        className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white resize-y"
      />
    );
  }

  // Default: text input — auto numeric for price-like keys
  const isPrice = f.key.toLowerCase().includes("price") || f.key.toLowerCase().includes("harga");
  return (
    <input
      value={String(item[f.key] ?? "")}
      onChange={(e) => update(idx, f.key, e.target.value)}
      inputMode={isPrice ? "numeric" : "text"}
      pattern={isPrice ? "[0-9]*" : undefined}
      placeholder={isPrice ? "contoh: 35000" : undefined}
      className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
    />
  );
}

export function ObjectListField({
  name,
  label,
  defaultValue = [],
  fields,
  categoryKey,
}: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>(
    defaultValue,
  );
  const [uploading, startUpload] = useTransition();
  const uploadRef = useRef<{ idx: number; key: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync state when server data changes (e.g. after save)
  useEffect(() => {
    setItems(defaultValue);
  }, [defaultValue]);

  const update = (idx: number, key: string, val: unknown) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  const add = (preset?: Record<string, unknown>) => {
    const blank: Record<string, unknown> = {};
    for (const f of fields) blank[f.key] = "";
    setItems((prev) => [...prev, { ...blank, ...preset }]);
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

  // Find category config from fields
  const catField = categoryKey
    ? fields.find((f) => f.key === categoryKey)
    : null;
  const catOptions = catField?.options || [];

  // Group items by category
  const groups = useMemo(() => {
    if (!categoryKey || catOptions.length === 0) {
      return [{ key: "_all", label: label, items: items.map((item, i) => ({ item, i })) }];
    }
    const map = new Map<string, { label: string; items: { item: Record<string, unknown>; i: number }[] }>();
    for (const opt of catOptions) {
      map.set(opt.value, { label: opt.label, items: [] });
    }
    items.forEach((item, i) => {
      const cat = String(item[categoryKey] || "_uncategorized");
      if (!map.has(cat)) map.set(cat, { label: cat, items: [] });
      map.get(cat)!.items.push({ item, i });
    });
    return Array.from(map.entries())
      .filter(([, g]) => g.items.length > 0)
      .map(([key, g]) => ({ key, label: g.label, items: g.items }));
  }, [items, categoryKey, catOptions, label]);

  const renderCard = (item: Record<string, unknown>, idx: number) => (
    <div
      key={idx}
      className="border border-[#2C2A29]/10 p-4 space-y-3 bg-white relative group"
    >
      <button
        type="button"
        onClick={() => remove(idx)}
        className="absolute top-2 right-2 text-[#8B5E56] hover:text-red-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} />
      </button>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
            {f.label}
          </label>
          {renderFieldInput(f, item, idx, update, pickImage, uploading)}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {label}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.key}>
            {/* Category header */}
            {categoryKey && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#632626]">
                  {group.label}
                </span>
                <span className="text-[9px] text-[#8B5E56] bg-[#8B5E56]/10 px-2 py-0.5">
                  {group.items.length}
                </span>
              </div>
            )}

            {/* Items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map(({ item, i }) => renderCard(item, i))}

              {/* Add button — preset category */}
              <button
                type="button"
                onClick={() =>
                  categoryKey && catOptions.length > 0
                    ? add({ [categoryKey]: group.key })
                    : add()
                }
                className="border-2 border-dashed border-[#E8E2D9] min-h-[120px] flex flex-col items-center justify-center hover:border-[#632626] hover:text-[#632626] transition-colors text-[#8B5E56] gap-1"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
                <span className="text-[9px] uppercase tracking-widest font-bold">
                  {categoryKey ? `Tambah ${group.label}` : "Tambah Item"}
                </span>
              </button>
            </div>
          </div>
        ))}

        {/* Empty state — no items and no category grouping */}
        {groups.length === 0 && (
          <button
            type="button"
            onClick={() => add()}
            className="w-full border-2 border-dashed border-[#E8E2D9] min-h-[120px] flex flex-col items-center justify-center hover:border-[#632626] hover:text-[#632626] transition-colors text-[#8B5E56] gap-1"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span className="text-[9px] uppercase tracking-widest font-bold">
              Tambah Item
            </span>
          </button>
        )}
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
