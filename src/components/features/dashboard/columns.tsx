"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  package: string;
  addons: string[] | null;
  status: "pending" | "confirmed" | "cancelled";
};

export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "name",
    header: "Pelanggan",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const phone = row.original.phone;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-heading text-[#2C2A29] uppercase">{name}</span>
          <a 
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#8B5E56] mt-1 font-bold hover:underline transition-all flex items-center gap-1"
          >
            {phone}
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent text-[10px] tracking-[0.2em] font-bold uppercase text-[#2C2A29] flex items-center gap-1"
        >
          Jadwal
          <HugeiconsIcon icon={MoreIcon} size={12} className={cn("rotate-90 transition-transform", column.getIsSorted() && "text-[#8B5E56]")} />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      const time = row.original.time;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-[#2C2A29] font-medium uppercase font-heading tracking-wide">
            {format(new Date(date), "dd MMM yyyy")}
          </span>
          <span className="text-[10px] text-[#8B5E56] font-bold mt-1 uppercase tracking-widest">
            {time}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "package",
    header: "Paket",
    cell: ({ row }) => {
      return (
        <span className="text-[10px] text-[#5A5550] uppercase tracking-widest">
          {row.getValue("package")}
        </span>
      );
    },
  },
  {
    accessorKey: "addons",
    header: "Tambahan",
    cell: ({ row }) => {
      const addons = row.getValue("addons") as string[] | null;
      return (
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {addons && addons.length > 0 ? (
            addons.map((addon, i) => (
              <span key={i} className="text-[8px] bg-[#EFEBDE]/50 border border-[#2C2A29]/5 text-[#5A5550] px-2 py-1 uppercase tracking-tighter shadow-sm">
                {addon}
              </span>
            ))
          ) : (
            <span className="text-[8px] opacity-20 uppercase">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={`text-[8px] tracking-[0.2em] uppercase font-bold px-2 py-0.5 rounded-none border-none ${
          status === 'confirmed' ? "bg-green-50 text-green-700" :
          status === 'cancelled' ? "bg-red-50 text-red-700" :
          "bg-amber-50 text-amber-700"
        }`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reservation = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreIcon} size={18} className="text-[#2C2A29]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none border-[#2C2A29]/10">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-50">Aksi</DropdownMenuLabel>
            <DropdownMenuItem 
              className="text-[10px] uppercase tracking-widest cursor-pointer"
              onClick={() => navigator.clipboard.writeText(reservation.id)}
            >
              Salin ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[10px] uppercase tracking-widest cursor-pointer text-green-600">Konfirmasi</DropdownMenuItem>
            <DropdownMenuItem className="text-[10px] uppercase tracking-widest cursor-pointer text-red-600">Batalkan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
