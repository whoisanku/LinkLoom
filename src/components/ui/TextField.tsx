
import type { InputHTMLAttributes } from 'react'
import type { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { ICONS } from '@/assets/icons/Icon'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string
  required?: boolean
  customLabel?: string
  placeholder?: string
  size?: 'small' | 'medium'
  type?: 'text' | 'email' | 'password' | 'search'
}

export const TextField: FC<TextFieldProps> = ({
  name,
  customLabel,
  required = false,
  size = 'small',
  placeholder = '',
  type = 'text',
  ...rest
}) => {
  const { control } = useFormContext()

  const Icon = () => {
    switch (type) {
      case 'search':
        return ICONS.search
      case 'email':
        return ICONS.email
      case 'password':
        return ICONS.password
      default:
        return null
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <label className="font-bold block mb-6 text-white">
            {customLabel} {required ? <span style={{ color: '#FF1943' }}>*</span> : ''}
          </label>
          <div className="flex items-center w-full bg-primary p-4 rounded-full overflow-hidden gap-2">
            <Icon />
            <input
              {...field}
              className={`${size === 'small' ? 'text-sm' : 'text-base'}  text-white w-full outline-none `}
              title={field?.value}
              {...rest}
              placeholder={placeholder}
            />
          </div>
          {error?.message && <p className="text-red-500 text-sm">{error?.message}</p>}
        </>
      )}
    />
  )
}

export default TextField

