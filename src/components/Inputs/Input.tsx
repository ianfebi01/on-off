import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
          className={cn( 'text-sm font-medium text-navy', labelClassName )}
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
        className={cn(
          'transition-all duration-200 ease-in-out h-10 py-2 px-4 rounded-full border border-navy/25 outline-none focus:ring-2 focus:outline-0 focus:ring-blue-400 placeholder:text-navy-overlay text-navy text-base w-full disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
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
