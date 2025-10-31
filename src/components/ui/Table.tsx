
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type Table as ReactTable,
} from '@tanstack/react-table'

interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
}

export default function Table<T extends object>({ data, columns }: TableProps<T>) {
  const table: ReactTable<T> = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className="w-full border-collapse border border-header rounded-md">
      <thead className="bg-primary text-white">
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id} className="text-left border-b border-header rounded-t-md">
            {hg.headers.map((header) => (
              <th key={header.id} className="py-2 px-4">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-header hover:bg-header rounded-b-md">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="text-left py-3 px-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

