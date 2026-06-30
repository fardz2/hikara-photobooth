"use client";

import { toast } from "sonner";
import { updateSectionContent } from "@/lib/actions/site-content-actions";
import { ImageField } from "./image-field";
import { GalleryField } from "./gallery-field";
import { TagListField } from "./tag-list-field";
import { ObjectListField } from "./object-list-field";

// ─── Field type detection ───

type FieldType = "image" | "gallery" | "tag-list" | "object-list" | "long-text" | "text";

const IMAGE_KEYS = /polaroid|image_url|img|logo|photo/i;
const LONG_TEXT_KEYS = /description|subtitle|tagline|address|content|quote/i;

function detectFieldType(key: string, value: unknown): FieldType {
  if (typeof value === "string" && IMAGE_KEYS.test(key) && value.startsWith("http")) return "image";
  if (Array.isArray(value) && typeof value[0] === "string") return "tag-list";
  if (Array.isArray(value) && typeof value[0] === "object") return "object-list";
  if (typeof value === "string" && (LONG_TEXT_KEYS.test(key) || value.length > 100)) return "long-text";
  return "text";
}

// ─── Section config (which fields to render how) ───

interface SectionFieldConfig {
  key: string;
  type: FieldType;
  label?: string;
  maxImages?: number;
  objectFields?: { key: string; label: string; type?: "text" | "textarea" }[];
}

const SECTION_CONFIG: Record<string, SectionFieldConfig[]> = {
  hero: [
    { key: "tagline", type: "text", label: "Tagline" },
    { key: "title_line1", type: "text", label: "Title Line 1" },
    { key: "title_highlight", type: "text", label: "Title Highlight" },
    { key: "title_line2", type: "text", label: "Title Line 2" },
    { key: "subtitle", type: "long-text", label: "Subtitle" },
    { key: "brand_name", type: "text", label: "Brand Name" },
    { key: "vertical_text_right", type: "text", label: "Vertical Text Right" },
    { key: "vertical_text_left", type: "text", label: "Vertical Text Left" },
    { key: "cta_text", type: "text", label: "CTA Text" },
    { key: "cta_link", type: "text", label: "CTA Link" },
    { key: "polaroid_1", type: "image", label: "Polaroid 1" },
    { key: "polaroid_2", type: "image", label: "Polaroid 2" },
    { key: "polaroid_3", type: "image", label: "Polaroid 3" },
  ],
  about: [
    { key: "image_url", type: "image", label: "Image URL" },
    { key: "description", type: "long-text", label: "Description" },
  ],
  gallery: [
    { key: "images", type: "gallery", label: "Gallery Images", maxImages: 3 },
  ],
  marquee: [
    { key: "text", type: "tag-list", label: "Marquee Text" },
  ],
  themes: [
    {
      key: "items", type: "object-list", label: "Themes",
      objectFields: [
        { key: "name", label: "Name" },
        { key: "desc", label: "Description", type: "textarea" },
        { key: "img", label: "Image URL" },
      ],
    },
  ],
  testimonials: [
    {
      key: "items", type: "object-list", label: "Testimonials",
      objectFields: [
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "author", label: "Author" },
        { key: "context", label: "Context" },
      ],
    },
  ],
  location: [
    { key: "address", type: "text", label: "Address" },
    { key: "phone", type: "text", label: "Phone" },
    { key: "hours", type: "text", label: "Hours" },
    { key: "map_embed_url", type: "text", label: "Map Embed URL" },
  ],
  cta: [
    { key: "title", type: "text", label: "Title" },
    { key: "description", type: "long-text", label: "Description" },
    { key: "button_text", type: "text", label: "Button Text" },
    { key: "button_link", type: "text", label: "Button Link" },
  ],
};

// ─── Component ───

interface SmartSectionFormProps {
  section: string;
  data: Record<string, unknown>;
}

export function SmartSectionForm({ section, data }: SmartSectionFormProps) {
  const config = SECTION_CONFIG[section];

  const handleSubmit = async (fd: FormData) => {
    if (!config) return;
    const entries = config.map((field) => {
      const raw = fd.get(`s_${field.key}`);
      let value: unknown = raw;
      // Parse JSON for structured fields
      if (["gallery", "tag-list", "object-list"].includes(field.type)) {
        try { value = JSON.parse(raw as string); } catch { value = raw; }
      }
      return { key: field.key, value };
    });
    const res = await updateSectionContent(section, entries);
    if ("error" in res && res.error) toast.error(res.error);
    else toast.success(`${section} updated`);
  };

  // Auto-detect mode if no config
  if (!config) {
    return <GenericSectionForm section={section} data={data} />;
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29] capitalize">{section}</h2>
      {config.map((field) => {
        const value = data[field.key];
        switch (field.type) {
          case "image":
            return (
              <ImageField
                key={field.key}
                name={`s_${field.key}`}
                label={field.label || field.key}
                defaultValue={String(value ?? "")}
              />
            );
          case "gallery":
            return (
              <GalleryField
                key={field.key}
                name={field.key}
                label={field.label || field.key}
                defaultValue={Array.isArray(value) ? (value as string[]) : []}
                maxImages={field.maxImages}
              />
            );
          case "tag-list":
            return (
              <TagListField
                key={field.key}
                name={field.key}
                label={field.label || field.key}
                defaultValue={Array.isArray(value) ? (value as string[]) : []}
              />
            );
          case "object-list":
            return (
              <ObjectListField
                key={field.key}
                name={field.key}
                label={field.label || field.key}
                defaultValue={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
                fields={field.objectFields || []}
              />
            );
          case "long-text":
            return (
              <div key={field.key}>
                <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
                  {field.label || field.key}
                </label>
                <textarea
                  name={`s_${field.key}`}
                  defaultValue={String(value ?? "")}
                  rows={4}
                  className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
                />
              </div>
            );
          default:
            return (
              <div key={field.key}>
                <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
                  {field.label || field.key}
                </label>
                <input
                  name={`s_${field.key}`}
                  defaultValue={String(value ?? "")}
                  className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white"
                />
              </div>
            );
        }
      })}
      <button
        type="submit"
        className="bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] transition-colors"
      >
        Simpan
      </button>
    </form>
  );
}

// ─── Generic fallback (auto-detect from data shape) ───

function GenericSectionForm({ section, data }: { section: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-sm text-[#5A5550]">No data yet for this section.</p>;
  }

  const handleSubmit = async (fd: FormData) => {
    const ups = entries.map(([key]) => {
      let value: unknown = fd.get(`s_${key}`);
      try { value = JSON.parse(value as string); } catch { /* keep string */ }
      return { key, value };
    });
    const res = await updateSectionContent(section, ups);
    if ("error" in res && res.error) toast.error(res.error);
    else toast.success(`${section} updated`);
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29] capitalize">{section}</h2>
      {entries.map(([key, value]) => {
        const ft = detectFieldType(key, value);
        switch (ft) {
          case "image":
            return <ImageField key={key} name={`s_${key}`} label={key} defaultValue={String(value ?? "")} />;
          case "gallery":
            return <GalleryField key={key} name={key} label={key} defaultValue={Array.isArray(value) ? (value as string[]) : []} maxImages={3} />;
          case "tag-list":
            return <TagListField key={key} name={key} label={key} defaultValue={Array.isArray(value) ? (value as string[]) : []} />;
          case "object-list":
            return <ObjectListField key={key} name={key} label={key} defaultValue={Array.isArray(value) ? (value as Record<string, unknown>[]) : []} fields={[{ key: "val", label: "Value" }]} />;
          case "long-text":
            return (
              <div key={key}>
                <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">{key}</label>
                <textarea name={`s_${key}`} defaultValue={String(value ?? "")} rows={4} className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white" />
              </div>
            );
          default:
            return (
              <div key={key}>
                <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">{key}</label>
                <input name={`s_${key}`} defaultValue={String(value ?? "")} className="mt-1 w-full border border-[#E8E2D9] rounded-none px-3 py-2 text-sm bg-white" />
              </div>
            );
        }
      })}
      <button type="submit" className="bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c] transition-colors">
        Simpan
      </button>
    </form>
  );
}
