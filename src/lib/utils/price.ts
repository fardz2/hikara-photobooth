import { getPricing, type PricingItem } from "../services/pricing-service";

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

  const extras = pricing.filter((p) => p.category === "extra");
  const extraPerson = extras.find((p) =>
    p.label.toLowerCase().includes("orang"),
  ) || { label: "Tambahan per Orang", price: 5000 };
  const extraPrint = extras.find((p) =>
    p.label.toLowerCase().includes("print"),
  ) || { label: "Extra Print", price: 10000 };

  let total = basePrice;
  total += (input.extraPeopleCount || 0) * (extraPerson?.price || 5000);
  total += (input.extraPrintCount || 0) * (extraPrint?.price || 10000);

  if (input.addons) {
    const addonItems = pricing.filter((p) => p.category === "addon");
    for (const addonId of input.addons) {
      const addon = addonItems.find((a) => a.id === addonId);
      if (addon) total += addon.price;
    }
  }

  return total;
}
