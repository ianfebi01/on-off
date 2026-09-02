import type { ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button as ShadcnButton } from '@/components/ui/button'
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

export default function Button( props: Props ) {
  const {
    children,
    className,
    variant = 'primary',
    disabled = false,
    loading = false,
    ariaLabel,
  } = props

  const classes = cn( disabled && 'button-disabled', className )

  const content = (
    <>
      {loading ? <Spinner /> : null}
      {variant === 'iconOnly' && loading ? null : children}
    </>
  )

  // Internal route link — `asChild` hands the button styling to the <Link>.
  if ( 'to' in props && props.to !== undefined ) {
    return (
      <ShadcnButton
        asChild
        variant={variant}
        className={classes}
        aria-label={ariaLabel}
        data-name="button"
      >
        <Link
          to={props.to}
          params={props.params}
          search={props.search}
          disabled={disabled || loading}
        >
          {content}
        </Link>
      </ShadcnButton>
    )
  }

  // External anchor
  if ( 'href' in props && props.href !== undefined ) {
    return (
      <ShadcnButton
        asChild
        variant={variant}
        className={classes}
        aria-label={ariaLabel}
        data-name="button"
      >
        <a
          href={props.href}
          target={props.target}
          rel={props.target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {content}
        </a>
      </ShadcnButton>
    )
  }

  // Native button
  const { type = 'button', onClick } = props as ButtonAsButton

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      variant={variant}
      className={classes}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      data-name="button"
    >
      {content}
    </ShadcnButton>
  )
}
