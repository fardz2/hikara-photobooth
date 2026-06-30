import { getPricing, type PricingDict } from "../data/pricing";

export interface PriceInput {
  packageId?: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}

export async function calculateTotalPrice(input: PriceInput): Promise<number> {
  const pricing = await getPricing();
  const pkg = pricing[input.packageId || "paket_utama"] || pricing.paket_utama;
  let total = pkg?.price || 0;

  total += (input.extraPeopleCount || 0) * (pricing.extra_person?.price || 5000);
  total += (input.extraPrintCount || 0) * (pricing.extra_print?.price || 10000);

  if (input.addons) {
    const addonPrices: Record<string, number> = {};
    if (pricing.custom_frame) addonPrices["custom_frame"] = pricing.custom_frame.price;
    for (const addonId of input.addons) {
      total += addonPrices[addonId] || 0;
    }
  }

  return total;
}

/** Synchronous version for contexts where pricing is already fetched */
export function calculateTotalPriceSync(input: PriceInput, pricing: PricingDict): number {
  const pkg = pricing[input.packageId || "paket_utama"] || pricing.paket_utama;
  let total = pkg?.price || 0;
  total += (input.extraPeopleCount || 0) * (pricing.extra_person?.price || 5000);
  total += (input.extraPrintCount || 0) * (pricing.extra_print?.price || 10000);
  if (input.addons) {
    const addonPrices: Record<string, number> = {};
    if (pricing.custom_frame) addonPrices["custom_frame"] = pricing.custom_frame.price;
    for (const addonId of input.addons) {
      total += addonPrices[addonId] || 0;
    }
  }
  return total;
}
