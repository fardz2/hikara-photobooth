"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateSectionContent } from "@/lib/actions/site-content-actions";
import { SECTION_CONFIG, fieldPath } from "./section-config";
import type { FieldDef } from "./section-config";
import { TextField } from "./fields/text-field";
import { ImageField } from "./fields/image-field";
import { GalleryField } from "./fields/gallery-field";
import { TagField } from "./fields/tag-field";
import { ObjectListField } from "./fields/object-list-field";

export function SectionFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48 rounded-none bg-[#2C2A29]/5" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-none bg-[#2C2A29]/5" />
      ))}
      <Skeleton className="h-9 w-28 rounded-none bg-[#2C2A29]/5" />
    </div>
  );
}

function renderField(section: string, def: FieldDef, value: unknown) {
  const name = fieldPath(section, def.key);
  const strVal = String(value ?? "");
  const arrVal = Array.isArray(value) ? value : [];

  switch (def.type) {
    case "image":
      return <ImageField key={def.key} name={name} label={def.label} defaultValue={strVal} />;
    case "gallery":
      return <GalleryField key={def.key} name={name} label={def.label} defaultValue={arrVal as string[]} max={def.max} />;
    case "tags":
      return <TagField key={def.key} name={name} label={def.label} defaultValue={arrVal as string[]} />;
    case "objects":
      return (
        <ObjectListField
          key={def.key}
          name={name}
          label={def.label}
          defaultValue={arrVal as Record<string, unknown>[]}
          fields={def.objectFields || []}
        />
      );
    case "textarea":
      return <TextField key={def.key} name={name} label={def.label} defaultValue={strVal} multiline />;
    default:
      return <TextField key={def.key} name={name} label={def.label} defaultValue={strVal} />;
  }
}

function reconstructFormValue(section: string, def: FieldDef, fd: FormData): unknown {
  const base = fieldPath(section, def.key);

  switch (def.type) {
    case "image":
      return fd.get(base) ?? "";
    case "gallery": {
      const count = Number(fd.get(`${base}_count`)) || 0;
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        const val = fd.get(`${base}_${i}`);
        if (val && typeof val === "string" && val.trim()) items.push(val.trim());
      }
      return items;
    }
    case "tags": {
      const raw = fd.get(base);
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
      return [];
    }
    case "objects": {
      const raw = fd.get(base);
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
      return [];
    }
    default:
      return fd.get(base) ?? "";
  }
}

interface Props {
  section: string;
  data: Record<string, unknown>;
}

export function SectionForm({ section, data }: Props) {
  const config = SECTION_CONFIG[section];
  if (!config) return <p className="text-sm text-[#5A5550]">Belum ada data untuk bagian ini.</p>;

  const action = async (fd: FormData) => {
    const entries = config.map((def) => ({
      key: def.key,
      value: reconstructFormValue(section, def, fd),
    }));
    const res = await updateSectionContent(section, entries);
    if ("error" in res && res.error) toast.error(res.error);
    else toast.success(`${section} berhasil disimpan`);
  };

  return (
    <form action={action} className="space-y-6">
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29] capitalize">{section}</h2>
      {config.map((def) => renderField(section, def, data[def.key]))}
      <Button type="submit" className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c]">
        Simpan
      </Button>
    </form>
  );
}
