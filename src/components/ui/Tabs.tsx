
import { useSearchParams } from 'react-router-dom'
import Dropdown from './Dropdown'
import Heading from './Typography'

type TabsProps = {
  name: string
  field: React.ReactNode
  key: string
}[]

export const Tabs = ({ tabs }: { tabs: TabsProps }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const activeTab = tabs.find((tab) => tab.key === mode)?.key ?? tabs[0]?.key
  const activeTabName = tabs.find((tab) => tab.key === mode)?.name ?? tabs[0]?.name

  const dropdownOptions = tabs.map((tab) => ({
    label: tab.name,
    value: tab.key,
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop View */}
      <div
        className="hidden md:flex items-center gap-6 text-[26px] font-bold leading-[30px]"
        role="tablist"
        aria-label="Top auctions toggle"
      >
        {tabs.map((tab) => (
          <span
            key={tab.key}
            role="tab"
            tabIndex={0}
            onClick={() => {
              setSearchParams({ mode: tab.key })
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setSearchParams({ mode: tab.key })
              }
            }}
            className={`cursor-pointer transition ${
              activeTab === tab.key ? 'text-white opacity-100' : 'text-white opacity-30 hover:opacity-60'
            }`}
          >
            {tab.name}
          </span>
        ))}
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex justify-between items-center">
        {/* <span className={`cursor-pointer transition text-white opacity-100`}>{activeTab}</span> */}
        <Heading variant="h3" title={activeTabName} color="white" fontWeight={700} />
        <Dropdown
          options={dropdownOptions}
          value={activeTabName}
          onChange={(value) => setSearchParams({ mode: value })}
          placeholder="Switch Table"
          variant="default"
        />
      </div>

      {tabs.find((tab) => tab.key === activeTab)?.field}
    </div>
  )
}

