import Page from '@/components/ui/Page';
import Search from './components/Search';
import Title from './components/Title';
import { CONSTANTS } from './constant/data.const';
import { Tabs } from '@/components/ui/Tabs';
import TargetTable from './components/TargetTable';
import IntroducerTable from './components/IntroducerTable';
import type { TabsProps } from '@/types/components';

export default function LinkLoomApp() {


  const tabsItem: TabsProps = [
    {
      name: 'Target',
      field: <TargetTable data={[]} />,
      key: 'targetTable'
    },
    {
      name: 'introducer',
      field: <IntroducerTable data={[]} />,
      key: 'introducerTable'
    },

  ]

  return (
    <Page>
      <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />
      <Search type={'target'} getSearchQuery={(data) => console.log(data)} />

      <Tabs tabs={tabsItem} />
    </Page>
  )

}
