import type { ReactNode } from "react";

type Column<T> = {
  header: string;
  key?: keyof T;
  render?: (row: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: Array<Column<T>>;
  data: T[];
  emptyMessage?: string;
  getRowKey?: (row: T, index: number) => string;
  loading?: boolean;
};

const Table = <T,>({
  columns,
  data,
  emptyMessage = "No records found.",
  getRowKey,
  loading = false,
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-5 py-3.5 font-semibold tracking-wide ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-5 py-4 text-gray-700 ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : col.key
                        ? String((row as Record<string, unknown>)[col.key as string] ?? "—")
                        : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
