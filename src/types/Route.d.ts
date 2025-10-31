
import { type LazyExoticComponent, type ComponentType } from 'react'

type TRoute = {
  path: string
  component: LazyExoticComponent<ComponentType<object>>
  children?: TRoute[]
  exact?: boolean
  pathname?: string
}

export type { TRoute }

