import { getPricing, type PricingItem } from "../services/site-content-service";

export interface PriceInput {
  packageId?: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}

export async function calculateTotalPrice(input: PriceInput): Promise<number> {
  const pricing = await getPricing();
  return calculateTotalPriceSync(input, pricing);
}

/** Synchronous version for contexts where pricing is already fetched */
export function calculateTotalPriceSync(input: PriceInput, pricing: PricingItem[]): number {
  const mainPkg = pricing.find((p) => p.maxPeople) || pricing[0];
  let total = mainPkg?.price || 0;

  const extraPerson = pricing.find((p) => p.label.includes("Orang")) || { price: 5000 };
  const extraPrint = pricing.find((p) => p.label.includes("Print")) || { price: 10000 };

  total += (input.extraPeopleCount || 0) * extraPerson.price;
  total += (input.extraPrintCount || 0) * extraPrint.price;

  if (input.addons) {
    for (const addonId of input.addons) {
      const addon = pricing.find((p) => p.label.includes(addonId));
      if (addon) total += addon.price;
    }
  }

  return total;
}
