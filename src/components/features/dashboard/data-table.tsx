"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const isTodayFilterActive = table.getColumn("date")?.getFilterValue() === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari pelanggan..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full sm:w-64 rounded-none border-[#2C2A29]/10 bg-white text-[10px] uppercase tracking-widest px-4 h-12 focus-visible:ring-0 focus-visible:border-[#8B5E56]/40 shadow-sm"
          />
          
          <Select
            onValueChange={(value) => {
              if (value === "all") {
                table.getColumn("date")?.setFilterValue("");
              } else if (value === "today") {
                table.getColumn("date")?.setFilterValue(format(new Date(), "yyyy-MM-dd"));
              }
            }}
          >
            <SelectTrigger className="w-[180px] rounded-none border-[#2C2A29]/10 bg-white text-[10px] uppercase tracking-widest h-12 focus:ring-0 shadow-sm">
              <SelectValue placeholder="Filter Jadwal" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#2C2A29]/10">
              <SelectItem value="all" className="text-[10px] uppercase tracking-widest">Semua Jadwal</SelectItem>
              <SelectItem value="today" className="text-[10px] uppercase tracking-widest text-[#8B5E56] font-bold">Hari Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-[8px] tracking-[0.3em] uppercase opacity-40 font-bold whitespace-nowrap">
           {table.getFilteredRowModel().rows.length} Hasil ditemukan
        </div>
      </div>
      <div className="bg-white border border-[#2C2A29]/5 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-[#F6F4F0]/50 border-b border-[#2C2A29]/5">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-6 py-5 text-[10px] tracking-[0.2em] font-bold uppercase text-[#2C2A29]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-[#2C2A29]/5">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-[#F6F4F0]/30 transition-colors border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-xs text-[#5A5550]/40 uppercase tracking-widest italic">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-none border-[#2C2A29]/10 text-[10px] uppercase tracking-widest h-10 px-6 font-medium"
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-none border-[#2C2A29]/10 text-[10px] uppercase tracking-widest h-10 px-6 font-medium"
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
