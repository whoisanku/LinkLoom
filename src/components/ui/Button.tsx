
import { forwardRef } from 'react'
import { type ReactNode, type ButtonHTMLAttributes, type JSX } from 'react'
import { ICONS } from '@/assets/icons/Icon'
import { cn } from '@lib/classname'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonIconPosition = 'left' | 'right'

export interface ButtonType extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: ButtonIconPosition
  children: ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary text-white hover:bg-primary/80 active:bg-primary/90',
  secondary: 'bg-secondary text-white hover:bg-secondary/80 active:bg-secondary/90',
  outline: 'bg-transparent border border-gray-300 text-white hover:text-black hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red text-white hover:bg-red/80 active:bg-red/90',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm leading-4 px-3 py-1.5 gap-1.5',
  md: 'text-base leading-[22px] px-4 py-2 gap-2',
  lg: 'text-lg leading-6 px-6 py-3 gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonType>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      iconPosition = 'left',
      children,
      disabled = false,
      fullWidth = false,
      loading = false,
      className,
      ...rest
    }: ButtonType,
    ref,
  ): JSX.Element => {
    const baseStyles = 'inline-flex justify-center items-center font-medium rounded-md transition-colors duration-200'
    const variantStyle = variantStyles[variant]
    const sizeStyle = sizeStyles[size]
    const widthStyle = fullWidth ? 'w-full' : ''
    const disabledStyle = disabled || loading ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'

    const combinedClassName = cn(baseStyles, variantStyle, sizeStyle, widthStyle, disabledStyle, className)

    const renderIcon = () => {
      if (loading) {
        return <span className="text-white">{ICONS.spin}</span>
      }
      return icon
    }

    return (
      <button disabled={disabled || loading} {...rest} ref={ref} className={combinedClassName}>
        {iconPosition === 'left' && renderIcon()}
        {children}
        {iconPosition === 'right' && renderIcon()}
      </button>
    )
  },
)

export default Button

