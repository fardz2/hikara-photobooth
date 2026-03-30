"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Pendapatan",
    color: "#2C2A29",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-[10px] uppercase tracking-widest text-[#5A5550]/40 font-bold">
        Tidak ada data transaksi di periode ini.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full mt-8">
      <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#2C2A29" strokeOpacity={0.05} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          minTickGap={32}
          tickFormatter={(value) => {
            return format(new Date(value), "dd MMM", { locale: localeId });
          }}
          style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", fill: "#5A5550", opacity: 0.8 }}
        />
        <ChartTooltip
          cursor={{ fill: "transparent" }}
          content={<ChartTooltipContent indicator="line" labelFormatter={(label) => format(new Date(label), "dd MMMM yyyy", { locale: localeId })} />}
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[2, 2, 0, 0]} className="hover:fill-[#8B5E56] transition-colors" />
      </BarChart>
    </ChartContainer>
  );
}
