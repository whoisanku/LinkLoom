import Table from '@ui/Table'
import Heading from '@ui/Typography'
import { CONSTANTS } from '@features/home/constant/data.const'
import type { ColumnDef } from '@tanstack/react-table'
import type { TIntroducer } from '@features/home/type/data'

const IntroducerTable = ({ data }: { data: TIntroducer[] }) => {
  const columns: ColumnDef<TIntroducer>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.username}</div>
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="text-sm text-secondary">{row.original.score}</div>
        </div>
      ),
    },
    {
      accessorKey: 'connections',
      header: 'Connections',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-white">{row.original.connections}</div>
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

export default IntroducerTable

