import { cn } from '@/lib/classname'
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
  rowClassName?: string,
  onRowClick?: (row: T) => void
}

export default function Table<T extends object>({ data, columns, rowClassName, onRowClick }: TableProps<T>) {
  const table: ReactTable<T> = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleRowClick = (row: T) => {
    if (onRowClick) {
      onRowClick(row)
    }
  }

  return (
    <div className='w-full border-collapse border border-header rounded-md overflow-x-scroll'>
      <table className="">
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
            <tr key={row.id} className={cn("border-b border-header hover:bg-header rounded-b-md", rowClassName ? 'cursor-pointer' : '')} onClick={() => handleRowClick(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="text-left py-3 px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
