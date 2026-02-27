import React, { useMemo, useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  accessor?: (row: T) => React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  pageSize?: number; // default 10
}

export default function Table<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  pageSize = 10,
}: TableProps<T>) {
  const [page, setPage] = useState(1);
  const total = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const windowPages = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 font-semibold text-gray-700 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={(row.id as string) || idx}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 ${col.className || ""}`}>
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? col.accessor(row)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          {total === 0
            ? "0 items"
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100 text-sm"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          {windowPages.map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page
                  ? "bg-gray-900 text-white"
                  : "border bg-white hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100 text-sm"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
