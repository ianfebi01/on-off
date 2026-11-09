import { useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/context/useAuth'
import Spinner from '@/components/Icons/Spinner'

export function ProtectedRoute( { children }: { children: React.ReactNode } ) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect( () => {
    if ( !isLoading && !isAuthenticated ) {
      navigate( {
        to     : '/login',
        search : { redirect : location.pathname },
      } )
    }
  }, [ isLoading, isAuthenticated, navigate, location.pathname ] )

  if ( isLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if ( !isAuthenticated ) {
    return null
  }

  return <>{children}</>
}

export function GuestRoute( { children }: { children: React.ReactNode } ) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect( () => {
    if ( !isLoading && isAuthenticated ) {
      const searchParams = new URLSearchParams( location.search )
      const redirect = searchParams.get( 'redirect' ) || '/'
      navigate( { to : redirect } )
    }
  }, [ isLoading, isAuthenticated, navigate, location.search ] )

  if ( isLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if ( isAuthenticated ) {
    return null
  }

  return <>{children}</>
}
