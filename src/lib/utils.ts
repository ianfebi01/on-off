import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge classes with tailwind-merge with clsx full feature */
export function cn( ...inputs: ClassValue[] ) {
  return twMerge( clsx( inputs ) )
}

/**
 * Resolve a generated client's `/api/**` path against the configured API
 * origin. Empty base keeps the call same-origin, which is what the web build
 * wants: it goes through the Nitro proxy so the session cookie stays
 * first-party. A Capacitor bundle has no proxy of its own, so it needs the
 * API's absolute origin.
 * @param path - Path from the generated client, already rooted at /api.
 * @param base - API origin, or '' for same-origin.
 * @returns URL to fetch.
 */
export function resolveApiUrl( path: string, base: string ): string {
  if ( base === '' || /^https?:\/\//i.test( path ) ) {
    return path
  }

  return `${base.replace( /\/+$/, '' )}${path.startsWith( '/' ) ? path : `/${path}`}`
}