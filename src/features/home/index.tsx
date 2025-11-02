import Page from '@/components/ui/Page';
import { Tabs } from '@/components/ui/Tabs';
import TargetTable from './components/TargetTable';
import IntroducerTable from './components/IntroducerTable';
import type { TabsProps } from '@/types/components';

export default function LinkLoomApp() {




  const tabsItem: TabsProps = [
    {
      name: 'Target',
      field: <TargetTable />,
      key: 'targetTable'
    },
    {
      name: 'Introducer',
      field: <IntroducerTable data={[]} />,
      key: 'introducerTable'
    },

  ]

  return (
    <Page>
      <div className='flex flex-col gap-2'>

        <Tabs tabs={tabsItem} />
      </div>
    </Page>
  )

}
