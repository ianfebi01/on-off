import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps<'div'> {
  children: ReactNode
}

/** Elevated rounded surface container with consistent padding and vertical spacing. */
export default function Card( { children, className, ...props }: Props ) {

  return (
    <div
      data-name="card"
      {...props}
      className={cn(
        'w-full rounded-4xl border border-navy/10 bg-white px-6 py-10 shadow-2xl flex flex-col gap-5',
        className
      )}
    >
      {children}
    </div>
  )
}
