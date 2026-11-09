import { resolveApiUrl } from "../lib/utils"
import { API_BASE_URL } from "./env"

const NO_CONTENT = 204

let refreshPromise: Promise<boolean> | null = null

async function requestTokenRefresh( apiBaseUrl: string ): Promise<boolean> {
  if ( refreshPromise ) {
    return refreshPromise
  }

  refreshPromise = ( async () => {
    try {
      const refreshUrl = resolveApiUrl( '/v1/auth/refresh', apiBaseUrl )
      const res = await fetch( refreshUrl, {
        method      : 'POST',
        credentials : 'include',
      } )

      return res.status === 200
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  } )()

  return refreshPromise
}

export async function apiFetch<T>( url: string, options?: RequestInit ): Promise<T> {
  const headers = new Headers( options?.headers )

  const apiBaseUrl = API_BASE_URL
  const target = resolveApiUrl( url, apiBaseUrl )

  const fetchOptions: RequestInit = {
    credentials : options?.credentials ?? 'include',
    ...options,
    headers,
  }

  let response = await fetch( target, fetchOptions )

  const isRefreshExcluded =
    url.includes( '/v1/auth/login' ) ||
    url.includes( '/v1/auth/register' ) ||
    url.includes( '/v1/auth/refresh' ) ||
    url.includes( '/v1/auth/logout' )

  if ( response.status === 401 && !isRefreshExcluded ) {
    const refreshed = await requestTokenRefresh( apiBaseUrl )
    if ( refreshed ) {
      response = await fetch( target, fetchOptions )
    }
  }

  const contentType = response.headers.get( 'content-type' )
  const data: unknown
    = response.status === NO_CONTENT || !contentType?.includes( 'application/json' )
      ? undefined
      : await response.json() as unknown

  return { data, headers : response.headers, status : response.status } as T
}
