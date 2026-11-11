import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { inputClassName, labelClassName as baseLabelClassName } from './inputStyles'

interface Props extends ComponentProps<'input'> {
  label?: ReactNode
  error?: string
  containerClassName?: string
  labelClassName?: string
}

/** Pill-styled form input with optional label and validation error message. */
export default function Input( {
  label,
  error,
  id,
  className,
  containerClassName,
  labelClassName,
  ...props
}: Props ) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const describedBy = error
    ? [ props[ 'aria-describedby' ], errorId ].filter( Boolean ).join( ' ' )
    : props[ 'aria-describedby' ]

  return (
    <div className={cn( 'flex flex-col gap-1.5', containerClassName )}>
      {label ? (
        <label
          htmlFor={inputId}
          className={cn( baseLabelClassName, labelClassName )}
        >
          {label}
        </label>
      ) : null}
      <input
        data-name="input"
        {...props}
        id={inputId}
        aria-invalid={error ? true : props[ 'aria-invalid' ]}
        aria-describedby={describedBy}
        className={cn( inputClassName, className )}
      />
      {error ? (
        <p
          id={errorId}
          className="text-xs text-red-500"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
