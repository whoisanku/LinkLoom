
import { Suspense } from 'react'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from '@config/routes/ProtectedRoutes'
import { useSelector } from 'react-redux'
import type { RootState } from '@config/Store'
import { RouteList } from '@config/routes/RoutesList'
import Layout from '@layout/Layout'
import type { TRoute } from '@type/Route'

const renderRoutes = (routes: TRoute[]) => {
  return routes.map((route: TRoute, i: number) => {
    if (route.children) {
      return route?.children?.map((child: TRoute, j: number) => (
        <Route path={child?.path} element={(<child.component />) as React.ReactNode} key={`${i}-${j}`} />
      ))
    }

    return <Route path={route.path} element={<route.component />} key={i} />
  })
}

const RoutesContainer = () => {
  const isAuthenticate = useSelector((state: RootState) => state?.auth?.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticate && !RouteList?.some((route: TRoute) => route.path === location?.pathname)) {
      navigate('/login')
    }
  }, [location.pathname, isAuthenticate, navigate])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {renderRoutes(RouteList)}
        </Route>
        <Route element={<ProtectedRoute isAuthenticated={true} />}>
          <Route path="*" element={<Navigate to="/page-not-found" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default RoutesContainer
