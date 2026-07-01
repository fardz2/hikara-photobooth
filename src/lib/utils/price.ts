import { getPricing, type PricingItem } from "../services/site-content-service";

export interface PriceInput {
  packageId?: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z]/g, "_")
    .replace(/_+/g, "_");

export async function calculateTotalPrice(input: PriceInput): Promise<number> {
  const pricing = await getPricing();
  return calculateTotalPriceSync(input, pricing);
}

/** Synchronous version for contexts where pricing is already fetched */
export function calculateTotalPriceSync(
  input: PriceInput,
  pricing: PricingItem[],
): number {
  const mainPkg = pricing.find((p) => p.maxPeople) || pricing[0];
  let total = mainPkg?.price || 0;

  const extraPerson =
    pricing.find(
      (p) =>
        p.label.toLowerCase().includes("tambahan") &&
        p.label.toLowerCase().includes("orang"),
    ) ||
    pricing.find(
      (p) => !p.maxPeople && p.label.toLowerCase().includes("orang"),
    );
  const extraPrint =
    pricing.find(
      (p) =>
        p.label.toLowerCase().includes("extra") &&
        p.label.toLowerCase().includes("print"),
    ) ||
    pricing.find(
      (p) => p.label.toLowerCase().includes("print") && !p.maxPeople,
    );

  total += (input.extraPeopleCount || 0) * (extraPerson?.price || 5000);
  total += (input.extraPrintCount || 0) * (extraPrint?.price || 10000);

  if (input.addons) {
    for (const addonId of input.addons) {
      const addon = pricing.find((p) => {
        if (p === mainPkg || p === extraPerson || p === extraPrint)
          return false;
        const normLabel = norm(p.label);
        const normId = norm(addonId);
        return normLabel.includes(normId) || normId.includes(normLabel);
      });
      if (addon) total += addon.price;
    }
  }

  return total;
}
