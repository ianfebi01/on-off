import { useState } from 'react'
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

  const [ isOn, setIsOn ] = useState( false )

  const [ lastData, setLastData ] = useState( data )
  if ( data !== lastData ) {
    setLastData( data )
    if ( data ) setIsOn( data.data?.data?.is_on ?? false )
  }

  const mutation = useSetBulb( {
    mutation : {
      onSuccess : ( _response, variables ) => {
        setIsOn( variables.data.is_on )
        queryClient.invalidateQueries( { queryKey : getGetBulbV1QueryKey() } )
      },
      onError : ( _error, variables ) => {
        setIsOn( !variables.data.is_on )
      },
    },
  } )

  const handleSwitchChange = ( value: boolean ) => {
    setIsOn( value )
    mutation.mutate( { data : { is_on : value } } )
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
          disabled={isPending || mutation.isPending}
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
