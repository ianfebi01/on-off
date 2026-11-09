import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import Header from './Header'

const queryClient = new QueryClient()

export default function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Header/>
          <Outlet />
        </AuthProvider>
      </QueryClientProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}