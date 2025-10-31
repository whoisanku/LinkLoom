
import Header from '@layout/Header'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="w-screen h-screen flex flex-col">
      {/* <Header /> */}
      <Outlet />
    </div>
  )
}

export default Layout
