import { useOptimistic, useTransition } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import Switch from '@/components/Inputs/Switch'
import { ProtectedRoute } from '@/components/Auth/AuthGuard'
import {
  getBulbV1,
  getGetBulbV1QueryKey,
  useGetBulbV1,
  useSetBulb,
} from '../api/generated/bulb/bulb'

export const Route = createFileRoute( '/' )( {
  component : IndexPage,
} )

function IndexPage() {
  return (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  )
}

function Index() {
  const queryClient = useQueryClient()

  const { isPending, error, data } = useGetBulbV1<
    Awaited<ReturnType<typeof getBulbV1>>,
    Error
  >()

  const serverIsOn = data?.data?.data?.is_on ?? false
  const [ isOn, setOptimisticIsOn ] = useOptimistic( serverIsOn )
  const [ isTransitioning, startTransition ] = useTransition()

  const mutation = useSetBulb()

  const handleSwitchChange = ( value: boolean ) => {
    startTransition( async () => {
      setOptimisticIsOn( value )
      try {
        await mutation.mutateAsync( { data : { is_on : value } } )
        // Keep the optimistic value until the server state is refreshed
        await queryClient.invalidateQueries( { queryKey : getGetBulbV1QueryKey() } )
      } catch {
        // Optimistic value reverts automatically when the transition ends;
        // the error is surfaced via mutation.error
      }
    } )
  }

  return (
    <div className="min-h-screen flex flex-col container">

      <main className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
        <h1 className="font-primary text-2xl text-navy">on-off</h1>
        {isPending ? (
          <div className="h-4 bg-gray-200 animate-pulse w-20 rounded" />
        ) : !error ? (
          <p className="text-navy-overlay">
            Your bulb is{' '}
            <code className="font-code text-navy-light">
              {isOn ? 'On' : 'Off'}
            </code>
          </p>
        ) : null}

        <Switch
          enabled={isOn}
          disabled={isPending || isTransitioning}
          setEnabled={handleSwitchChange}
        />

        {mutation.error || error ? (
          <p className="text-red-500 text-sm">
            Something went wrong, please try again later.
          </p>
        ) : null}
      </main>
    </div>
  )
}
