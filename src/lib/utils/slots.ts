export const START_HOUR = 14;
export const END_HOUR = 23;

/**
 * Generates 30-minute interval time slots from START_HOUR to END_HOUR.
 * Example: 10:00, 10:30, ..., 22:30
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  slots.push(`${END_HOUR.toString().padStart(2, "0")}:00`);
  return slots;
}
