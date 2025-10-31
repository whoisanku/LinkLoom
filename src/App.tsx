
import '@/App.css'
import { useAccount, useConnect } from 'wagmi'
import { useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
function App() {
 
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
  }
 
  return (
    <button
      type="button"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect
    </button>
  )
}

export default App

