import { PRICELIST, ADDONS, EXTRA_PERSON_PRICE, EXTRA_PRINT_PRICE } from "../constants/reservation";

interface PriceInput {
  packageId?: string;
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}

/**
 * Calculates the total price for a reservation based on base price, 
 * extra people, extra prints, and selected addons.
 */
export function calculateTotalPrice(input: PriceInput): number {
  // Find package price or default to the first one (paket_utama)
  const selectedPackage = PRICELIST.find(p => p.id === input.packageId) || PRICELIST[0];
  let totalPrice = selectedPackage.price;
  
  totalPrice += (input.extraPeopleCount || 0) * EXTRA_PERSON_PRICE;
  totalPrice += (input.extraPrintCount || 0) * EXTRA_PRINT_PRICE;
  
  if (input.addons) {
    input.addons.forEach(addonId => {
      const addon = ADDONS.find(a => a.id === addonId);
      if (addon) {
        totalPrice += addon.price;
      }
    });
  }

  return totalPrice;
}
