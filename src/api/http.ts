import { resolveApiUrl } from "../lib/utils"

const NO_CONTENT = 204

export async function apiFetch<T>( url: string, options?: RequestInit ): Promise<T> {
  const headers = new Headers( options?.headers )

  const apiBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
  const target = resolveApiUrl( url, apiBaseUrl )

  const response = await fetch( target, { ...options, headers, credentials : 'include' } )

  const contentType = response.headers.get( 'content-type' )
  const data: unknown
    = response.status === NO_CONTENT || !contentType?.includes( 'application/json' )
      ? undefined
      : await response.json() as unknown

  return { data, headers : response.headers, status : response.status } as T
}