import { useAccount, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Heading from '@ui/Typography'
import Button from '../ui/Button'

const ProfileButton = () => {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()

  if (isConnected) {
    return (
      <>
        <div>You're connected!</div>
        <div>Address: {address}</div>
      </>
    )
  } else {
    return (
      <Button
        type="button"
        onClick={() => connect({ connector: connectors[0] })}
      >
        Connect
      </Button>
    )
  }
}

const Header = () => {

  return (
    <div className="bg-header py-4 px-8 flex justify-between items-center sticky top-0 z-10">
      <Heading variant="h2" title="Link Loom" color="white" fontWeight={700} />
      <div className="flex gap-4">
        <ProfileButton />
      </div>
    </div>
  )
}

export default Header
