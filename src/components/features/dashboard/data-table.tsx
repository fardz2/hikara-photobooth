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
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";



interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPageChange,
  currentPage = 1,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // Only update if value actually changed from what's in URL to avoid loops
    if (searchValue === (searchParams.get("q") || "")) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) params.set("q", searchValue);
      else params.delete("q");
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
    if (onPageChange) onPageChange(page);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: !!pageCount,
    manualFiltering: true, // Tell table we handle filtering on the server
    pageCount: pageCount,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4 text-[#2C2A29]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari pelanggan..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full sm:w-64 rounded-none border-[#2C2A29]/10 bg-white text-[10px] uppercase tracking-widest px-4 h-12 focus-visible:ring-0 focus-visible:border-[#2C2A29]/30 shadow-none hover:border-[#2C2A29]/30 transition-colors"
          />
        </div>

        <div className="text-[8px] tracking-[0.3em] uppercase opacity-40 font-bold whitespace-nowrap">
           {searchParams.get("q") ? `Pencarian: "${searchParams.get("q")}"` : `${table.getCoreRowModel().rows.length} Hasil ditampilkan`}
        </div>
      </div>
      <div className="bg-white border border-[#2C2A29]/10 overflow-hidden">
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
      <div className="flex items-center justify-between pt-6 pb-2 border-t border-transparent">
        <div className="hidden sm:block text-[10px] font-medium tracking-widest text-[#5A5550] uppercase">
          Menampilkan Halaman <span className="text-[#2C2A29] font-bold">{currentPage}</span> dari <span className="text-[#2C2A29] font-bold">{pageCount || 1}</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || (onPageChange ? false : !table.getCanPreviousPage())}
            className="rounded-none border-[#2C2A29]/10 text-[10px] uppercase tracking-widest h-11 px-5 font-bold hover:bg-[#2C2A29] hover:text-white transition-all duration-300 disabled:opacity-30 flex items-center gap-2 group"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={14} className="group-hover:-translate-x-1 transition-transform" />
            Sebelumnya
          </Button>
          <div className="sm:hidden text-[10px] font-bold tracking-widest text-[#2C2A29]">
            {currentPage} / {pageCount || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (pageCount || 1) || (onPageChange ? false : !table.getCanNextPage())}
            className="rounded-none border-[#2C2A29]/10 text-[10px] uppercase tracking-widest h-11 px-5 font-bold hover:bg-[#2C2A29] hover:text-white transition-all duration-300 disabled:opacity-30 flex items-center gap-2 group"
          >
            Selanjutnya
            <HugeiconsIcon icon={ArrowRight02Icon} size={14} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
