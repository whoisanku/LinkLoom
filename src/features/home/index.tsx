import Page from '@/components/ui/Page';
import { useState } from 'react';
import Search from './components/Search';

export default function LinkLoomApp() {

  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchQuery = (data: string) => { setSearchQuery(data) }

  console.log(searchQuery)


  return (
    <Page>
      <div className='flex flex-col justify-center h-full pb-30'>

        <Search type={'target'} getSearchQuery={handleSearchQuery} />

      </div>
    </Page>
  )

}
