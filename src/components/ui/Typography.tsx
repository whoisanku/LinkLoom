
import { type ReactNode, type JSX } from 'react'
import { cn } from '@/lib/classname'

export type TypographyType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'body'
  | 'body-field'
  | 'body-s'
  | 'body-xs'
  | 'body-xxs'

export interface HeadingType {
  variant: TypographyType
  icon?: string | ReactNode
  title: string | number | ReactNode
  disabled?: boolean
  color?: string
  fontWeight?: 400 | 500 | 600 | 700
  onClick?: any
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const variantStyles: Record<TypographyType, string> = {
  h1: 'text-4xl leading-10',
  h2: 'text-3xl leading-[38px]',
  h3: 'text-[26px] leading-[30px]',
  h4: 'text-[22px] leading-[25px]',
  h5: 'text-xl leading-6',
  h6: 'text-base leading-[18px]',
  p: 'text-4xl leading-10',
  span: 'text-base leading-[22px]',
  body: 'text-base leading-[22px]',
  'body-field': 'text-base leading-4',
  'body-s': 'text-sm leading-[18px]',
  'body-xs': 'text-xs leading-[14px]',
  'body-xxs': 'text-[10px] leading-3',
}

const fontWeightStyles: Record<number, string> = {
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
}

const Heading = ({ variant, icon, title, disabled, color, fontWeight = 400, onClick, ...rest }: HeadingType): any => {
  const textTag = HEADING_TAGS.includes(variant) ? variant : 'span'
  const Component = textTag as keyof JSX.IntrinsicElements

  const baseStyles = 'flex justify-start items-center text-balance'
  const variantStyle = variantStyles[variant] || variantStyles.span
  const fontWeightStyle = fontWeightStyles[fontWeight] || 'font-normal'
  const cursorStyle = onClick ? 'cursor-pointer' : ''
  const disabledStyle = disabled ? 'opacity-50 pointer-events-none' : ''

  const combinedClassName = cn(baseStyles, variantStyle, fontWeightStyle, cursorStyle, disabledStyle)

  return (
    <Component className={combinedClassName} style={{ color: color || '#000000' }} onClick={onClick} {...rest}>
      {icon}
      {title}
    </Component>
  )
}

export default Heading

