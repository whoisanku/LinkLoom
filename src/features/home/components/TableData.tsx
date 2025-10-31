
import Table from '@ui/Table'
import Heading from '@ui/Typography'
import { CONSTANTS } from '@features/home/constant/data.const'
import type { ColumnDef } from '@tanstack/react-table'
import type { FolderTableRow } from '@features/home/type/FolderTableRow'

const TableData = ({ data }: { data: FolderTableRow[] }) => {
  const columns: ColumnDef<FolderTableRow>[] = [
    {
      accessorKey: 'folderName',
      header: 'Folder Name',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.folderName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'folderDescription',
      header: 'Folder Description',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-secondary">{row.original.folderDescription}</div>
        </div>
      ),
    },
    {
      accessorKey: 'folderPath',
      header: 'Folder Path',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.folderPath}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto flex flex-col gap-2">
      <Heading variant="h3" title={CONSTANTS.TABLE.HEADING} color="white" fontWeight={700} />
      <Table data={data} columns={columns} />
    </div>
  )
}

export default TableData

