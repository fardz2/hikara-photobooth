"use client";

import type { PricingItem } from "@/lib/services/pricing-service";
import { getColumns, type Reservation } from "./columns";
import { DataTable } from "./data-table";

interface Props {
  pricing: PricingItem[];
  data: Reservation[];
  pageCount?: number;
  currentPage?: number;
}

export function ReservationTable({ pricing, data, ...rest }: Props) {
  return (
    <DataTable
      columns={getColumns(pricing)}
      data={data}
      {...rest}
    />
  );
}
