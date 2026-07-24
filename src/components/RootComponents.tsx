import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}