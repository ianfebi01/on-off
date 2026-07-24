import type { ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import Spinner from '@/components/Icons/Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'icon'
  | 'iconOnly'
  | 'link'
  | 'error'

interface BaseProps {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
}

interface ButtonAsButton extends BaseProps {
  to?: undefined
  href?: undefined
  type?: 'submit' | 'button' | 'reset'
  onClick?: ( e: React.MouseEvent<HTMLButtonElement, MouseEvent> ) => void
}

interface ButtonAsLink extends BaseProps {
  /** Internal route — renders a TanStack Router <Link> */
  to: LinkProps['to']
  params?: LinkProps['params']
  search?: LinkProps['search']
  href?: undefined
}

interface ButtonAsAnchor extends BaseProps {
  /** External URL — renders a plain <a> */
  href: string
  target?: string
  to?: undefined
}

type Props = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

const variantClass: Record<ButtonVariant, string> = {
  primary   : 'button-primary',
  secondary : 'button-secondary',
  outline   : 'button-outline',
  icon      : 'button-icon',
  iconOnly  : 'button-icon-only',
  link      : 'button-link',
  error     : 'button-error',
}

export default function Button( props: Props ) {
  const {
    children,
    className,
    variant = 'primary',
    disabled = false,
    loading = false,
    ariaLabel,
  } = props

  const classes = cn(
    'button',
    variantClass[variant],
    disabled && 'button-disabled',
    className
  )

  const content = (
    <>
      {loading ? <Spinner /> : null}
      {variant === 'iconOnly' && loading ? null : children}
    </>
  )

  // Internal route link
  if ( 'to' in props && props.to !== undefined ) {
    return (
      <Link
        to={props.to}
        params={props.params}
        search={props.search}
        className={classes}
        aria-label={ariaLabel}
        disabled={disabled || loading}
        data-name="button"
      >
        {content}
      </Link>
    )
  }

  // External anchor
  if ( 'href' in props && props.href !== undefined ) {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={classes}
        aria-label={ariaLabel}
        data-name="button"
      >
        {content}
      </a>
    )
  }

  // Native button
  const { type = 'button', onClick } = props as ButtonAsButton

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      data-name="button"
    >
      {content}
    </button>
  )
}
