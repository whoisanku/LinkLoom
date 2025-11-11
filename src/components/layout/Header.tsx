import { useAccount, useConnect } from 'wagmi'
import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Heading from '@ui/Typography'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'
type UserProfile = {
  fid: number
  displayName?: string
  username?: string
  pfpUrl?: string
}

const ProfileButton = () => {
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadContext = async () => {
      try {
        await sdk.actions.ready()
        const context = await sdk.context
        if (!isMounted) return
        if (context?.user) {
          const { fid, displayName, username, pfpUrl } = context.user
          setUser({ fid, displayName, username, pfpUrl })
        }
      } catch (error) {
        console.error('Failed to load Farcaster user context', error)
      }
    }

    void loadContext()

    return () => {
      isMounted = false
    }
  }, [])

  if (isConnected) {
    return (
      <>
        <div className="flex items-center cursor-pointer gap-3">
          {user?.pfpUrl ? (
            <img src={user.pfpUrl} alt={user?.displayName || 'Farcaster user'} className="w-8 h-8 rounded-full object-cover" onClick={() => navigate('/profile')}/>
          ) : null}
        </div>
       
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

  const navigate = useNavigate()

  return (
    <div className="bg-header py-2 px-2 flex justify-between items-center sticky top-0 z-10">
      <Heading
        variant="h3"
        title="Link Loom"
        color="white"
        fontWeight={700}
        onClick={() => {
          navigate('/');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('linkloom:reset'))
          }
        }}
      />
      <div className="flex gap-4">
        <ProfileButton />
      </div>
    </div>
  )
}

export default Header
