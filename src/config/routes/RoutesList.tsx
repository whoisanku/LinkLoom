
import { lazy } from 'react'
import type { TRoute } from '@type/Route'

export const RouteList: TRoute[] = [
  {
    path: '/',
    component: lazy(() => import('@/features/home')),
  },
] as const
