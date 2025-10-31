
import Heading from '@ui/Typography'

const Title = ({ mainheading, subHeading }: { mainheading: string; subHeading: string }) => {
  return (
    <div className="flex flex-col gap-5 items-center w-full text-center">
      <Heading variant="h1" title={mainheading} color="white" fontWeight={700} />
      <Heading variant="body" title={subHeading} color="white" />
    </div>
  )
}

export default Title
