import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { id } from "date-fns/locale";

export type DateRangePreset = "today" | "week" | "month" | "all";

export interface DateRange {
  from: string; // yyyy-MM-dd
  to: string;   // yyyy-MM-dd
  label: string;
}

export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return {
        from: format(startOfDay(now), "yyyy-MM-dd"),
        to: format(endOfDay(now), "yyyy-MM-dd"),
        label: "Hari Ini",
      };
    case "week":
      return {
        from: format(startOfWeek(now, { locale: id }), "yyyy-MM-dd"),
        to: format(endOfWeek(now, { locale: id }), "yyyy-MM-dd"),
        label: "Minggu Ini",
      };
    case "month":
      return {
        from: format(startOfMonth(now), "yyyy-MM-dd"),
        to: format(endOfMonth(now), "yyyy-MM-dd"),
        label: "Bulan Ini",
      };
    case "all":
    default:
      return {
        from: format(subDays(now, 365 * 5), "yyyy-MM-dd"),
        to: format(endOfDay(now), "yyyy-MM-dd"),
        label: "Semua",
      };
  }
}

export function parseDateRangeParams(
  searchParams: {
    range?: string;
    from?: string;
    to?: string;
  },
  defaultRange: DateRangePreset = "month"
): DateRange {
  // Custom date range takes priority
  if (searchParams.from && searchParams.to) {
    return {
      from: searchParams.from,
      to: searchParams.to,
      label: `${searchParams.from} – ${searchParams.to}`,
    };
  }

  const preset = (searchParams.range ?? defaultRange) as DateRangePreset;
  return getDateRangeFromPreset(preset);
}
