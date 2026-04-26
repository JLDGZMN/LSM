"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage: string;
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 7,
  });

  React.useEffect(() => {
    setPagination((current) => {
      const nextPageCount = Math.max(1, Math.ceil(data.length / current.pageSize));
      const nextPageIndex = Math.min(current.pageIndex, nextPageCount - 1);

      if (nextPageIndex === current.pageIndex) {
        return current;
      }

      return {
        ...current,
        pageIndex: nextPageIndex,
      };
    });
  }, [data.length]);

  // TanStack Table owns its internal memoization; React Compiler flags this known pattern.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = Math.max(1, table.getPageCount());
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div className="overflow-hidden rounded-[30px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/96 shadow-[0_20px_56px_rgba(63,32,18,0.09)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[color:var(--color-surface-muted)]/96 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-semibold text-[var(--color-foreground)]"
                  >
                    {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-lg px-1 py-1 transition hover:text-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)]",
                            header.column.getCanSort() ? "cursor-pointer" : "cursor-default",
                          )}
                        >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === "asc" ? "^" : null}
                        {header.column.getIsSorted() === "desc" ? "v" : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--color-border)]/70 bg-[color:var(--color-surface-strong)]/95 align-top transition hover:bg-[rgba(123,17,19,0.06)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-[var(--color-foreground)]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-[var(--color-muted-foreground)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)]/70 bg-[color:var(--color-surface-muted)]/82 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-4 text-sm font-medium text-[var(--color-foreground)] shadow-[0_6px_18px_rgba(63,32,18,0.04)] transition hover:bg-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
            >
            Previous
          </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-4 text-sm font-medium text-[var(--color-foreground)] shadow-[0_6px_18px_rgba(63,32,18,0.04)] transition hover:bg-[var(--color-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50"
            >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
