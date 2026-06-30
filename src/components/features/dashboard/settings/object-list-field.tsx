"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Add01Icon } from "@hugeicons/core-free-icons";

interface ObjectListFieldProps {
  name: string;
  label: string;
  defaultValue?: Record<string, unknown>[];
  fields: { key: string; label: string; type?: "text" | "textarea" | "image" }[];
}

export function ObjectListField({ name, label, defaultValue = [], fields }: ObjectListFieldProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>(defaultValue);

  const updateItem = (idx: number, key: string, value: unknown) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const addItem = () => {
    const blank: Record<string, unknown> = {};
    for (const f of fields) blank[f.key] = "";
    setItems((prev) => [...prev, blank]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="mt-2 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="border border-[#2C2A29]/10 p-4 space-y-3 bg-white relative group">
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="absolute top-2 right-2 text-[#8B5E56] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => updateItem(idx, f.key, e.target.value)}
                    rows={3}
                    className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
                  />
                ) : (
                  <input
                    value={String(item[f.key] ?? "")}
                    onChange={(e) => updateItem(idx, f.key, e.target.value)}
                    className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 border-2 border-dashed border-[#E8E2D9] w-full py-3 text-[10px] uppercase tracking-widest font-bold text-[#8B5E56] hover:border-[#632626] hover:text-[#632626] transition-colors flex items-center justify-center gap-1"
      >
        <HugeiconsIcon icon={Add01Icon} size={12} />
        Tambah Item
      </button>
    </div>
  );
}
