
import { memo, type HTMLAttributes } from 'react'
import { cn } from '@lib/classname'

export interface ShimmerProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string
  height?: number | string
  rounded?: boolean | string
}

const Shimmer = memo(({ width, height, rounded = false, className, style, ...props }: ShimmerProps) => {
  const roundedClass = typeof rounded === 'string' ? `rounded-${rounded}` : rounded ? 'rounded' : ''

  return <div className={cn('shimmer', roundedClass, className)} style={{ width, height, ...style }} {...props} />
})

Shimmer.displayName = 'Shimmer'

export default Shimmer

