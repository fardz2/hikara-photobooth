import { getPricing, type PricingItem } from "../services/pricing-service";

export interface PriceInput {
  packageId?: string;
  extras?: Record<string, number>; // item ID → qty
  addons?: string[];
}

export async function calculateTotalPrice(input: PriceInput): Promise<number> {
  const pricing = await getPricing();
  return calculateTotalPriceSync(input, pricing);
}

/** Synchronous version for contexts where pricing is already fetched */
export function calculateTotalPriceSync(
  input: PriceInput,
  pricing: PricingItem[],
): number {
  const mainPkg = input.packageId
    ? pricing.find((p) => p.id === input.packageId)
    : undefined;
  const basePrice = mainPkg?.price || (
    pricing.find((p) => p.category === "package")?.price ?? 0
  );

  const extraItems = pricing.filter((p) => p.category === "extra");

  let total = basePrice;
  if (input.extras) {
    for (const [id, qty] of Object.entries(input.extras)) {
      const item = extraItems.find((e) => e.id === id);
      if (item) total += item.price * qty;
    }
  }

  if (input.addons) {
    const addonItems = pricing.filter((p) => p.category === "addon");
    for (const addonId of input.addons) {
      const addon = addonItems.find((a) => a.id === addonId);
      if (addon) total += addon.price;
    }
  }

  return total;
}
