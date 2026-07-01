"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type PricingCategory = "package" | "extra" | "addon";

export interface PricingItem {
  id?: string;
  label: string;
  price: number;
  maxQty?: number | null;
  note?: string | null;
  category: PricingCategory;
  sortOrder?: number;
}

const COLUMNS = "id, label, price, max_qty, note, category, sort_order";

function toItem(row: Record<string, unknown>): PricingItem {
  return {
    id: row.id as string,
    label: row.label as string,
    price: row.price as number,
    maxQty: (row.max_qty as number) ?? null,
    note: (row.note as string) ?? null,
    category: row.category as PricingCategory,
    sortOrder: row.sort_order as number,
  };
}

// ── Read (public, cached) ──

export async function getPricing(): Promise<PricingItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.pricing);

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("pricing_items")
    .select(COLUMNS)
    .order("sort_order");
  if (!data) return [];
  return data.map(toItem);
}

// ── Read (admin, no cache) ──

export async function getAllPricing(): Promise<PricingItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pricing_items")
    .select(COLUMNS)
    .order("sort_order");
  if (!data) return [];
  return data.map(toItem);
}

// ── Mutations ──

export async function upsertPricingItem(item: PricingItem) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    label: item.label,
    price: item.price,
    max_qty: item.maxQty ?? null,
    note: item.note ?? null,
    category: item.category,
    sort_order: item.sortOrder ?? 0,
  };
  if (item.id) payload.id = item.id;
  const { data, error } = await supabase
    .from("pricing_items")
    .upsert(payload, { onConflict: "id" })
    .select(COLUMNS)
    .single();
  if (error) return { error: error.message };
  return { data: toItem(data) };
}

export async function deletePricingItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pricing_items")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
