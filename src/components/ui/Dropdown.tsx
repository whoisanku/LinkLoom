
import { type ReactNode, useState, useRef, useEffect, type JSX } from 'react'
import Button, { type ButtonVariant, type ButtonSize } from './Button'

export interface DropdownOption {
  label: string
  value: string
  disabled?: boolean
}

export interface DropdownType {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  icon?: ReactNode
}

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
}: DropdownType): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption?.label || placeholder

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const chevronIcon = (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <div ref={dropdownRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        icon={icon}
        iconPosition="left"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-between"
      >
        <span className="flex-1 text-left">{displayText}</span>
        {chevronIcon}
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={`w-full text-left px-4 py-2 transition-colors ${
                option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown

