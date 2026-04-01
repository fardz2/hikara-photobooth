export const BASE_PRICE = 35000;
export const EXTRA_PERSON_PRICE = 5000;
export const EXTRA_PRINT_PRICE = 10000;

export const ADDON_PRICES: Record<string, number> = {
  "custom_frame": 15000,
};

interface PriceInput {
  extraPeopleCount?: number;
  extraPrintCount?: number;
  addons?: string[];
}

/**
 * Calculates the total price for a reservation based on base price, 
 * extra people, extra prints, and selected addons.
 */
export function calculateTotalPrice(input: PriceInput): number {
  let totalPrice = BASE_PRICE;
  
  totalPrice += (input.extraPeopleCount || 0) * EXTRA_PERSON_PRICE;
  totalPrice += (input.extraPrintCount || 0) * EXTRA_PRINT_PRICE;
  
  if (input.addons) {
    input.addons.forEach(addonId => {
      if (ADDON_PRICES[addonId]) {
        totalPrice += ADDON_PRICES[addonId];
      }
    });
  }

  return totalPrice;
}
