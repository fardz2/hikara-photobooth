"use client";

import { useState, Suspense } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/auth-actions";
import { updateSectionContent, updatePricing } from "@/lib/actions/site-content-actions";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// ─── Types ───

type SectionTab = "hero" | "marquee" | "about" | "gallery" | "themes" | "testimonials" | "location" | "cta";
type Tab = SectionTab | "pricing" | "password";

const SECTIONS: { id: SectionTab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "themes", label: "Themes" },
  { id: "testimonials", label: "Testimonials" },
  { id: "location", label: "Location" },
  { id: "cta", label: "CTA" },
];

const ALL_TABS: { id: Tab; label: string }[] = [
  ...SECTIONS,
  { id: "pricing", label: "Pricing" },
  { id: "password", label: "Password" },
];

interface SettingsClientProps {
  sectionData: Record<string, unknown>;
  pricing: Record<string, { label: string; price: number; maxPeople?: number; note?: string }>;
}

// ─── Skeleton for each section ───

function SectionFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
}

// ─── Main Client ───

export function SettingsClient({ sectionData, pricing }: SettingsClientProps) {
  const [tab, setTab] = useState<Tab>("hero");

  const activeTabStyle = "bg-[#632626] text-white";
  const inactiveTabStyle = "text-[#5A5550] hover:bg-[#EBE6DF]";

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
        {ALL_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full whitespace-nowrap uppercase tracking-wider transition-colors ${
              tab === t.id ? activeTabStyle : "bg-[#EBE6DF] text-[#5A5550]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar */}
      <nav className="hidden md:block w-48 shrink-0 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3">
          Content
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
              tab === s.id ? activeTabStyle : inactiveTabStyle
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 mt-6">
          Settings
        </div>
        <button
          onClick={() => setTab("pricing")}
          className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
            tab === "pricing" ? activeTabStyle : inactiveTabStyle
          }`}
        >
          Pricing
        </button>
        <button
          onClick={() => setTab("password")}
          className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
            tab === "password" ? activeTabStyle : inactiveTabStyle
          }`}
        >
          Change Password
        </button>
      </nav>

      {/* Content area — each tab has its own Suspense boundary */}
      <div className="flex-1 max-w-2xl">
        {tab === "password" && <ChangePasswordForm />}

        {tab === "pricing" && (
          <Suspense fallback={<SectionFormSkeleton />}>
            <PricingForm pricing={pricing} />
          </Suspense>
        )}

        {SECTIONS.map(
          (s) =>
            tab === s.id && (
              <Suspense key={s.id} fallback={<SectionFormSkeleton />}>
                <SmartSectionForm
                  section={s.id}
                  data={(sectionData[s.id] as Record<string, unknown>) || {}}
                />
              </Suspense>
            ),
        )}
      </div>
    </div>
  );
}

// ─── Smart Section Form ───

function SmartSectionForm({ section, data }: { section: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);

  if (entries.length === 0)
    return <p className="text-sm text-[#5A5550]">No data yet for this section.</p>;

  return (
    <form
      action={async (fd) => {
        const upsertEntries = entries.map(([key]) => ({
          key,
          value: reconstructValue(section, key, data[key], fd),
        }));
        const res = await updateSectionContent(section, upsertEntries);
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success(`${section} content updated`);
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29] capitalize">
        {section}
      </h2>

      {entries.map(([key, value]) => (
        <SmartField key={key} section={section} keyName={key} value={value} />
      ))}

      <button
        type="submit"
        className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors"
      >
        Simpan
      </button>
    </form>
  );
}

// ─── Value reconstruction from FormData ───

function reconstructValue(
  section: string,
  key: string,
  originalValue: unknown,
  fd: FormData,
): unknown {
  // Array of objects (themes.items / testimonials.items)
  if (
    key === "items" &&
    Array.isArray(originalValue) &&
    originalValue.length > 0 &&
    typeof originalValue[0] === "object"
  ) {
    const proto = originalValue[0] as Record<string, unknown>;
    const objKeys = Object.keys(proto);
    const items: Record<string, unknown>[] = [];
    let idx = 0;
    while (true) {
      const firstVal = fd.get(`${section}_${key}_${idx}_${objKeys[0]}`);
      if (firstVal === null || (typeof firstVal === "string" && firstVal.trim() === "")) break;
      const item: Record<string, unknown> = {};
      for (const ok of objKeys) {
        const raw = fd.get(`${section}_${key}_${idx}_${ok}`);
        if (ok === "images" && typeof raw === "string") {
          // images field: each line is a URL
          item[ok] = raw
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          item[ok] = raw ?? "";
        }
      }
      items.push(item);
      idx++;
    }
    return items;
  }

  // Array of any kind (gallery.images, marquee items)
  if (Array.isArray(originalValue)) {
    const items: string[] = [];
    let idx = 0;
    while (true) {
      const val = fd.get(`${section}_${key}_${idx}`);
      if (val === null) break;
      const s = typeof val === "string" ? val.trim() : String(val);
      if (s !== "") items.push(s);
      idx++;
    }
    return items;
  }

  // Simple string
  return fd.get(`${section}_${key}`) ?? "";
}

// ─── Smart Field Router ───

function SmartField({
  section,
  keyName,
  value,
}: {
  section: string;
  keyName: string;
  value: unknown;
}) {
  // Array of objects — themes.items or testimonials.items
  if (
    keyName === "items" &&
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object"
  ) {
    const first = value[0] as Record<string, unknown>;
    if ("name" in first) {
      return <ThemeItemsField section={section} keyName={keyName} items={value as any[]} />;
    }
    if ("quote" in first) {
      return <TestimonialItemsField section={section} keyName={keyName} items={value as any[]} />;
    }
  }

  // Array of URL strings (gallery.images)
  if (
    keyName === "images" &&
    Array.isArray(value) &&
    value.every((v) => typeof v === "string")
  ) {
    return <ImageArrayField section={section} keyName={keyName} urls={value as string[]} />;
  }

  // Array of plain strings (marquee)
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return <StringArrayField section={section} keyName={keyName} items={value as string[]} />;
  }

  // String value
  if (typeof value === "string") {
    const isImgKey =
      keyName === "image_url" || keyName.startsWith("polaroid_") || keyName === "img";
    const looksLikeUrl = /^https?:\/\//.test(value);
    if (isImgKey || looksLikeUrl) {
      return <ImageField section={section} keyName={keyName} url={value} />;
    }
    const isLong = value.length > 120 || value.includes("\n");
    return <TextField section={section} keyName={keyName} value={value} multiline={isLong} />;
  }

  // Fallback: render as JSON textarea
  const strVal = JSON.stringify(value, null, 2);
  return <TextField section={section} keyName={keyName} value={strVal} multiline />;
}

// ─── Text Input / Textarea ───

function TextField({
  section,
  keyName,
  value,
  multiline = false,
}: {
  section: string;
  keyName: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {keyName.replace(/_/g, " ")}
      </label>
      {multiline ? (
        <textarea
          name={`${section}_${keyName}`}
          defaultValue={value}
          rows={Math.min(value.split("\n").length, 6)}
          className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white resize-y"
        />
      ) : (
        <input
          name={`${section}_${keyName}`}
          defaultValue={value}
          className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
        />
      )}
    </div>
  );
}

// ─── Image URL with Preview ───

function ImageField({
  section,
  keyName,
  url,
}: {
  section: string;
  keyName: string;
  url: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(url);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {keyName.replace(/_/g, " ")}
      </label>
      <input
        name={`${section}_${keyName}`}
        defaultValue={url}
        onChange={(e) => {
          setPreviewUrl(e.target.value);
          setImgLoaded(false);
          setImgError(false);
        }}
        className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
        placeholder="https://..."
      />
      {previewUrl && /^https?:\/\//.test(previewUrl) && (
        <div className="mt-2 relative w-32 h-20 rounded overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF]">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full rounded" />
            </div>
          )}
          {imgError && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#5A5550] bg-white/80">
              Invalid URL
            </div>
          )}
          <Image
            src={previewUrl}
            alt={keyName}
            fill
            className={`object-cover ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

// ─── Gallery: Array of Image URLs ───

function ImageArrayField({
  section,
  keyName,
  urls,
}: {
  section: string;
  keyName: string;
  urls: string[];
}) {
  const [items, setItems] = useState<string[]>(urls.length > 0 ? urls : [""]);

  const addItem = () => setItems([...items, ""]);
  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    setItems(next);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-2">
        {keyName.replace(/_/g, " ")}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <input
              name={`${section}_${keyName}_${idx}`}
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder="https://..."
              className="w-full border border-[#E8E2D9] rounded px-2 py-1.5 text-xs bg-white mb-1"
            />
            {item && /^https?:\/\//.test(item) && (
              <div className="relative aspect-square rounded overflow-hidden border border-[#E8E2D9] bg-[#EBE6DF]">
                <Image
                  src={item}
                  alt={`${keyName} ${idx}`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-xs text-[#632626] hover:underline"
      >
        + Add URL
      </button>
    </div>
  );
}

// ─── Array of Strings (e.g. marquee) ───

function StringArrayField({
  section,
  keyName,
  items,
}: {
  section: string;
  keyName: string;
  items: string[];
}) {
  const [list, setList] = useState<string[]>(items.length > 0 ? items : [""]);

  const addItem = () => setList([...list, ""]);
  const removeItem = (idx: number) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, val: string) => {
    const next = [...list];
    next[idx] = val;
    setList(next);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-1">
        {keyName.replace(/_/g, " ")}
      </label>
      <div className="space-y-2">
        {list.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              name={`${section}_${keyName}_${idx}`}
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              className="flex-1 border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
            />
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-xs text-[#632626] hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}

// ─── Editable Cards: Theme Items ───

function ThemeItemsField({
  section,
  keyName,
  items,
}: {
  section: string;
  keyName: string;
  items: { name: string; desc: string; img: string; images?: string[] }[];
}) {
  const [list, setList] = useState(items);

  const addItem = () => setList([...list, { name: "", desc: "", img: "", images: [] }]);
  const removeItem = (idx: number) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: string, value: unknown) => {
    const next = [...list];
    (next[idx] as Record<string, unknown>)[field] = value;
    setList(next);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-2">
        {keyName.replace(/_/g, " ")}
      </label>
      <div className="space-y-4">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="border border-[#E8E2D9] rounded-lg p-4 space-y-3 bg-white relative group"
          >
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
            <input
              name={`${section}_${keyName}_${idx}_name`}
              value={item.name}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder="Theme name"
              className="w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white font-medium"
            />
            <textarea
              name={`${section}_${keyName}_${idx}_desc`}
              value={item.desc}
              onChange={(e) => updateItem(idx, "desc", e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
                  Image URL
                </label>
                <input
                  name={`${section}_${keyName}_${idx}_img`}
                  value={item.img}
                  onChange={(e) => updateItem(idx, "img", e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full border border-[#E8E2D9] rounded px-2 py-1.5 text-xs bg-white"
                />
              </div>
              {item.img && /^https?:\/\//.test(item.img) && (
                <div className="relative w-14 h-14 shrink-0 rounded overflow-hidden border border-[#E8E2D9]">
                  <Image
                    src={item.img}
                    alt={item.name || "theme"}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
                Gallery Images (one URL per line)
              </label>
              <textarea
                name={`${section}_${keyName}_${idx}_images`}
                value={Array.isArray(item.images) ? item.images.join("\n") : (item.images as string) ?? ""}
                onChange={(e) =>
                  updateItem(
                    idx,
                    "images",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={2}
                placeholder="https://..."
                className="mt-1 w-full border border-[#E8E2D9] rounded px-2 py-1.5 text-xs bg-white resize-y"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 text-xs text-[#632626] hover:underline"
      >
        + Add theme
      </button>
    </div>
  );
}

// ─── Editable Cards: Testimonial Items ───

function TestimonialItemsField({
  section,
  keyName,
  items,
}: {
  section: string;
  keyName: string;
  items: { quote: string; author: string; context: string }[];
}) {
  const [list, setList] = useState(items);

  const addItem = () => setList([...list, { quote: "", author: "", context: "" }]);
  const removeItem = (idx: number) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: string, value: string) => {
    const next = [...list];
    (next[idx] as Record<string, string>)[field] = value;
    setList(next);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium block mb-2">
        {keyName.replace(/_/g, " ")}
      </label>
      <div className="space-y-4">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="border border-[#E8E2D9] rounded-lg p-4 space-y-3 bg-white relative group"
          >
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
            <textarea
              name={`${section}_${keyName}_${idx}_quote`}
              value={item.quote}
              onChange={(e) => updateItem(idx, "quote", e.target.value)}
              placeholder="Quote"
              rows={2}
              className="w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white resize-y"
            />
            <input
              name={`${section}_${keyName}_${idx}_author`}
              value={item.author}
              onChange={(e) => updateItem(idx, "author", e.target.value)}
              placeholder="Author name"
              className="w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
            />
            <input
              name={`${section}_${keyName}_${idx}_context`}
              value={item.context}
              onChange={(e) => updateItem(idx, "context", e.target.value)}
              placeholder="Context (e.g., event type)"
              className="w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 text-xs text-[#632626] hover:underline"
      >
        + Add testimonial
      </button>
    </div>
  );
}

// ─── Change Password (unchanged) ───

function ChangePasswordForm() {
  return (
    <form
      action={async (fd) => {
        const res = await changePassword(fd);
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success("Password berhasil diubah");
      }}
      className="space-y-4"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">
        Change Password
      </h2>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
          Password Lama
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
          Password Baru
        </label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">
          Konfirmasi Password Baru
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <button
        type="submit"
        className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors"
      >
        Simpan Password
      </button>
    </form>
  );
}

// ─── Pricing Form (unchanged) ───

function PricingForm({
  pricing,
}: {
  pricing: Record<string, { label: string; price: number; maxPeople?: number; note?: string }>;
}) {
  return (
    <form
      action={async (fd) => {
        const entries = Object.entries(pricing).map(([key, item]) => ({
          key,
          value: {
            label: (fd.get(`${key}_label`) as string) || item.label,
            price: Number(fd.get(`${key}_price`)) || item.price,
            ...(item.maxPeople !== undefined
              ? { maxPeople: Number(fd.get(`${key}_maxPeople`)) || item.maxPeople }
              : {}),
            ...(item.note !== undefined
              ? { note: (fd.get(`${key}_note`) as string) || item.note }
              : {}),
          },
        }));
        const res = await updatePricing(entries);
        if ("error" in res && res.error) toast.error(res.error);
        else toast.success("Harga berhasil diupdate");
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Pricing</h2>
      {Object.entries(pricing).map(([key, item]) => (
        <div key={key} className="border border-[#E8E2D9] rounded-lg p-4 space-y-3 bg-white">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#2C2A29]">
            {item.label}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Label</label>
              <input
                name={`${key}_label`}
                defaultValue={item.label}
                className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
                Harga (Rp)
              </label>
              <input
                name={`${key}_price`}
                type="number"
                defaultValue={item.price}
                className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm"
              />
            </div>
            {item.maxPeople !== undefined && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">
                  Max Orang
                </label>
                <input
                  name={`${key}_maxPeople`}
                  type="number"
                  defaultValue={item.maxPeople}
                  className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm"
                />
              </div>
            )}
            {item.note !== undefined && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Note</label>
                <input
                  name={`${key}_note`}
                  defaultValue={item.note}
                  className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      ))}
      <button
        type="submit"
        className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors"
      >
        Simpan Harga
      </button>
    </form>
  );
}
