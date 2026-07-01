"use client";

import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

interface Props {
  name: string;
  label: string;
  defaultValue?: string[];
}

export function TagField({ name, label, defaultValue = [] }: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (!val || tags.includes(val)) return;
    setTags((prev) => [...prev, val]);
    setInput("");
  };

  const remove = (idx: number) =>
    setTags((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {label}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-[#F6F4F0] border border-[#2C2A29]/10 px-3 py-1.5 text-xs text-[#2C2A29]"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[#8B5E56] hover:text-red-600"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Tambah tag..."
          className="flex-1 border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
        />
        <button
          type="button"
          onClick={add}
          className="bg-[#632626] text-white px-3 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] transition-colors flex items-center gap-1"
        >
          <HugeiconsIcon icon={Add01Icon} size={12} />
          Tambah
        </button>
      </div>
    </div>
  );
}
