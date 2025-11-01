import Table from '@ui/Table'
import { CONSTANTS } from '@features/home/constant/data.const'
import type { ColumnDef } from '@tanstack/react-table'
import type { TTarget } from '@features/home/type/data'
import Search from './Search'
import Title from './Title'

const TargetTable = ({ data }: { data: TTarget[] }) => {
  const columns: ColumnDef<TTarget>[] = [
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
          <div className="font-semibold text-white">{row.original.relevance}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-2">

      <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING.TARGET} subHeading={CONSTANTS.TITLE.SUB_HEADING.TARGET} />

      <Search type={'target'} getSearchQuery={(data) => console.log(data)} />

      <Table data={data} columns={columns} />
    </div>
  )
}

export default TargetTable

