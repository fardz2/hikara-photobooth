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
import { updateReservationStatus, deleteReservation } from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { ProofPreview } from "./proof-preview";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  package: string;
  addons: string[] | null;
  status: "pending" | "confirmed" | "cancelled";
  extra_people_count?: number;
  extra_print_count?: number;
  total_price?: number;
  payment_method?: "tunai" | "qris";
  payment_proof_url?: string | null;
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
    accessorKey: "total_people",
    header: "Orang",
    cell: ({ row }) => {
      const extra = row.original.extra_people_count || 0;
      const total = 4 + extra;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-[#2C2A29] font-bold">{total} Orang</span>
          {extra > 0 && <span className="text-[8px] text-[#8B5E56] uppercase tracking-tighter">(+{extra} Extra)</span>}
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
    accessorKey: "total_price",
    header: "Total",
    cell: ({ row }) => {
      const price = row.getValue("total_price") as number || 35000;
      return (
        <span className="text-[10px] font-bold text-[#8B5E56]">
          Rp {price.toLocaleString('id-ID')}
        </span>
      );
    },
  },
  {
    accessorKey: "payment_method",
    header: "Pembayaran",
    cell: ({ row }) => {
      const method = row.original.payment_method || "tunai";
      const proofUrl = row.original.payment_proof_url;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className={`text-[8px] uppercase font-bold rounded-none tracking-widest px-2 py-0.5 w-fit ${
            method === 'qris' ? "border-[#2C2A29]/20 text-[#2C2A29] bg-transparent" : "border-none bg-[#2C2A29] text-white"
          }`}>
            {method}
          </Badge>
          {method === 'qris' && proofUrl && (
            <ProofPreview url={proofUrl} />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "addons",
    header: "Tambahan",
    cell: ({ row }) => {
      const addons = row.getValue("addons") as string[] | null;
      const extraPrint = row.original.extra_print_count || 0;
      return (
        <div className="flex gap-1 flex-wrap max-w-[150px]">
          {extraPrint > 0 && (
            <span className="text-[8px] bg-[#8B5E56] text-white px-2 py-1 uppercase tracking-tighter shadow-sm font-bold">
              {extraPrint} Extra Print
            </span>
          )}
          {addons && addons.length > 0 ? (
            addons.map((addon, i) => (
              <span key={i} className="text-[8px] bg-[#EFEBDE]/50 border border-[#2C2A29]/5 text-[#5A5550] px-2 py-1 uppercase tracking-tighter shadow-sm">
                {addon}
              </span>
            ))
          ) : !extraPrint ? (
            <span className="text-[8px] opacity-20 uppercase">-</span>
          ) : null}
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
        <Badge variant="outline" className={`text-[8px] tracking-[0.2em] uppercase font-bold px-2 py-0.5 rounded-none ${
          status === 'confirmed' ? "border-emerald-600/20 text-emerald-700 bg-emerald-50/50" :
          status === 'cancelled' ? "border-red-600/20 text-red-700 bg-red-50/50" :
          "border-amber-600/20 text-amber-700 bg-amber-50/50"
        }`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell reservation={row.original} />,
  },
];

const ActionCell = ({ reservation }: { reservation: Reservation }) => {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: "confirmed" | "cancelled") => {
    startTransition(async () => {
      const result = await updateReservationStatus(reservation.id, status);
      if (result.success) {
        toast.success(`Status berhasil diubah menjadi ${status}`);
      } else {
        toast.error("Gagal mengubah status");
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini secara permanen?")) return;
    
    startTransition(async () => {
      const result = await deleteReservation(reservation.id);
      if (result.success) {
        toast.success("Data berhasil dihapus");
      } else {
        toast.error("Gagal menghapus data");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          {isPending ? (
            <HugeiconsIcon icon={Loading03Icon} size={18} className="text-[#8B5E56] animate-spin" />
          ) : (
            <HugeiconsIcon icon={MoreIcon} size={18} className="text-[#2C2A29]" />
          )}
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
        {reservation.status !== "confirmed" && (
          <DropdownMenuItem 
            className="text-[10px] uppercase tracking-widest cursor-pointer text-green-600 font-bold"
            onClick={() => handleUpdateStatus("confirmed")}
            disabled={isPending}
          >
            Konfirmasi
          </DropdownMenuItem>
        )}
        {reservation.status !== "cancelled" && (
          <DropdownMenuItem 
            className="text-[10px] uppercase tracking-widest cursor-pointer text-red-600"
            onClick={() => handleUpdateStatus("cancelled")}
            disabled={isPending}
          >
            Batalkan
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-[10px] uppercase tracking-widest cursor-pointer text-red-600 font-bold bg-red-50 hover:bg-red-100"
          onClick={handleDelete}
          disabled={isPending}
        >
          Hapus Permanen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
