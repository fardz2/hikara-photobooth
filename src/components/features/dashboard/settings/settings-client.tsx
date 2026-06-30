"use client";

import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/auth-actions";
import { updateSectionContent, updatePricing } from "@/lib/actions/site-content-actions";

type Tab = "hero" | "pricing" | "password";

const SECTIONS: { id: string; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "marquee", label: "Marquee" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "themes", label: "Themes" },
  { id: "testimonials", label: "Testimonials" },
  { id: "location", label: "Location" },
  { id: "cta", label: "CTA" },
];

interface SettingsClientProps {
  sectionData: Record<string, unknown>;
  pricing: Record<string, { label: string; price: number; maxPeople?: number; note?: string }>;
}

export function SettingsClient({ sectionData, pricing }: SettingsClientProps) {
  const [tab, setTab] = useState<Tab | string>("hero");

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <nav className="w-48 shrink-0 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3">Content</div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
              tab === s.id ? "bg-[#632626] text-white" : "text-[#5A5550] hover:bg-[#EBE6DF]"
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold mb-3 mt-6">Settings</div>
        <button
          onClick={() => setTab("pricing")}
          className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
            tab === "pricing" ? "bg-[#632626] text-white" : "text-[#5A5550] hover:bg-[#EBE6DF]"
          }`}
        >
          Pricing
        </button>
        <button
          onClick={() => setTab("password")}
          className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
            tab === "password" ? "bg-[#632626] text-white" : "text-[#5A5550] hover:bg-[#EBE6DF]"
          }`}
        >
          Change Password
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-2xl">
        {tab === "password" && <ChangePasswordForm />}

        {tab === "pricing" && (
          <PricingForm pricing={pricing} />
        )}

        {SECTIONS.map((s) =>
          tab === s.id ? (
            <SectionForm key={s.id} section={s.id} data={(sectionData[s.id] as Record<string, unknown>) || {}} />
          ) : null
        )}
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  return (
    <form
      action={async (fd) => {
        const res = await changePassword(fd);
        if (res.error) toast.error(res.error);
        else toast.success("Password berhasil diubah");
      }}
      className="space-y-4"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Change Password</h2>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">Password Lama</label>
        <input name="currentPassword" type="password" required className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">Password Baru</label>
        <input name="newPassword" type="password" required minLength={6} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white" />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">Konfirmasi Password Baru</label>
        <input name="confirmPassword" type="password" required minLength={6} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white" />
      </div>
      <button type="submit" className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors">
        Simpan Password
      </button>
    </form>
  );
}

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
            label: fd.get(`${key}_label`) as string || item.label,
            price: Number(fd.get(`${key}_price`)) || item.price,
            ...(item.maxPeople !== undefined ? { maxPeople: Number(fd.get(`${key}_maxPeople`)) || item.maxPeople } : {}),
            ...(item.note !== undefined ? { note: fd.get(`${key}_note`) as string || item.note } : {}),
          },
        }));
        const res = await updatePricing(entries);
        if (res.error) toast.error(res.error);
        else toast.success("Harga berhasil diupdate");
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Pricing</h2>
      {Object.entries(pricing).map(([key, item]) => (
        <div key={key} className="border border-[#E8E2D9] rounded-lg p-4 space-y-3 bg-white">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[#2C2A29]">{item.label}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Label</label>
              <input name={`${key}_label`} defaultValue={item.label} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Harga (Rp)</label>
              <input name={`${key}_price`} type="number" defaultValue={item.price} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm" />
            </div>
            {item.maxPeople !== undefined && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Max Orang</label>
                <input name={`${key}_maxPeople`} type="number" defaultValue={item.maxPeople} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm" />
              </div>
            )}
            {item.note !== undefined && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5A5550]">Note</label>
                <input name={`${key}_note`} defaultValue={item.note} className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm" />
              </div>
            )}
          </div>
        </div>
      ))}
      <button type="submit" className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors">
        Simpan Harga
      </button>
    </form>
  );
}

function SectionForm({ section, data }: { section: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);

  if (entries.length === 0) return <p className="text-sm text-[#5A5550]">No data yet for this section.</p>;

  return (
    <form
      action={async (fd) => {
        const upsertEntries = entries.map(([key]) => {
          let value: unknown = fd.get(`${section}_${key}`);
          // Try parsing as JSON (for arrays/objects)
          try {
            value = JSON.parse(value as string);
          } catch {
            // keep as string
          }
          return { key, value };
        });
        const res = await updateSectionContent(section, upsertEntries);
        if (res.error) toast.error(res.error);
        else toast.success(`${section} content updated`);
      }}
      className="space-y-4"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29] capitalize">{section}</h2>
      {entries.map(([key, value]) => {
        const strVal = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "");
        const isMultiline = strVal.length > 80 || strVal.includes("\n");
        return (
          <div key={key}>
            <label className="text-xs uppercase tracking-wider text-[#5A5550] font-medium">{key}</label>
            {isMultiline ? (
              <textarea
                name={`${section}_${key}`}
                defaultValue={strVal}
                rows={Math.min(strVal.split("\n").length, 10)}
                className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm font-mono bg-white"
              />
            ) : (
              <input
                name={`${section}_${key}`}
                defaultValue={strVal}
                className="mt-1 w-full border border-[#E8E2D9] rounded px-3 py-2 text-sm bg-white"
              />
            )}
          </div>
        );
      })}
      <button type="submit" className="bg-[#632626] text-white px-6 py-2 text-xs uppercase tracking-widest rounded hover:bg-[#4a1c1c] transition-colors">
        Simpan
      </button>
    </form>
  );
}
