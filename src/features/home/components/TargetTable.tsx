import Table from '@ui/Table'
import { CONSTANTS } from '@features/home/constant/data.const'
import type { ColumnDef } from '@tanstack/react-table'
import type { TTarget } from '@features/home/type/data'
import Search from './Search'
import Title from './Title'
import { useTarget } from '../hooks/useTarget'
import { useMemo, useState, useCallback } from 'react'

const TargetTable = () => {
  const { targets, searchTargets } = useTarget() // Use targets directly
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) {
      return targets // Return the original targets array
    }
    return searchTargets(searchQuery)
  }, [searchQuery, targets, searchTargets])

  const handleSearchQuery = useCallback((query: string) => {
    console.log(query, 'query')
    setSearchQuery(query)
    setIsLoading(false)
  }, [])

  const columns: ColumnDef<TTarget>[] = useMemo(
    () => [
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
        accessorKey: 'relevance',
        header: 'Relevance',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-300">{row.original.relevance}</div>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-2">
      <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING.TARGET} subHeading={CONSTANTS.TITLE.SUB_HEADING.TARGET} />
      <Search type={'target'} getSearchQuery={handleSearchQuery} isLoading={isLoading} setIsLoading={setIsLoading} />
      <Table
        data={filteredTargets}
        rowClassName="cursor-pointer hover:bg-gray-800 transition-colors"
        onRowClick={(row) => console.log('Clicked:', row.id)}
        columns={columns}
      />
    </div>
  )
}

export default TargetTable
