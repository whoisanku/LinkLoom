
import Heading from '@ui/Typography'

const Header = () => {
  return (
    <div className="bg-header py-4 px-8 flex justify-between items-center sticky top-0 z-10">
      <Heading variant="h1" title="Logo" color="white" fontWeight={700} />
      <div className="flex gap-4">
        <Heading variant="h6" title="dummy_link" color="white" fontWeight={700} />
        <Heading variant="h6" title="dummy_link" color="white" fontWeight={700} />
        <Heading variant="h6" title="dummy_link" color="white" fontWeight={700} />
        <Heading variant="h6" title="dummy_link" color="white" fontWeight={700} />
      </div>
    </div>
  )
}

export default Header
