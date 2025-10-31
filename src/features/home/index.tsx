
import Page from '@ui/Page'
import Title from '@features/home/components/Title'
import { CONSTANTS } from '@features/home/constant/data.const'
import TableData from '@features/home/components/TableData'
import { TABLE_DATA } from '@features/home/constant/tableData.const'

const Home = () => {

  return (
    <Page>
      <div className="">
        <section className="flex flex-col py-10 gap-5">
          <Title mainheading={CONSTANTS.TITLE.MAIN_HEADING} subHeading={CONSTANTS.TITLE.SUB_HEADING} />
        </section>
        <section className="py-2">
          <TableData data={TABLE_DATA} />
        </section>
      </div>
    </Page>
  )
}

export default Home

