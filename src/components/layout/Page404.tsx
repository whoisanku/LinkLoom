
import Heading from '@ui/Typography'
import Page from '@ui/Page'
import { useNavigate } from 'react-router-dom'
import Button from '@ui/Button'

const Page404 = () => {
  const navigate = useNavigate()

  return (
    <Page>
      <div className="flex flex-col gap-5 justify-center items-center h-screen">
        <Heading variant="h1" title="Page not found" color="white" />

        <Button variant="secondary" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </div>
    </Page>
  )
}

export default Page404
