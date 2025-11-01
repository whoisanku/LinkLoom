import Page from '@/components/ui/Page';
import Search from './components/Search';
import Title from './components/Title';
import { CONSTANTS } from './constant/data.const';
import { Tabs } from '@/components/ui/Tabs';
import TargetTable from './components/TargetTable';
import IntroducerTable from './components/IntroducerTable';
import type { TabsProps } from '@/types/components';
import { useEffect, useState } from 'react';
import type { TMode } from './type/data';
import { useSearchParams } from 'react-router-dom';

export default function LinkLoomApp() {

  const [urlSearchParam] = useSearchParams();
  const [mode, setMode] = useState<TMode>('target');

  useEffect(() => {
    const mode = urlSearchParam.get('mode');
    if (mode === 'introducer' || mode === 'target') {
      setMode(mode);
    }
  }, [urlSearchParam]);


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
      <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING.TARGET} subHeading={CONSTANTS.TITLE.SUB_HEADING.TARGET} />
      <Search type={mode} getSearchQuery={(data) => console.log(data)} />

      <Tabs tabs={tabsItem} />
    </Page>
  )

}
