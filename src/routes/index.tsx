import Switch from '@/components/Inputs/Switch'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  getBulbV1,
  getGetBulbV1QueryKey,
  useGetBulbV1,
  useSetBulb,
} from '../api/generated/bulb/bulb'
import { useState } from 'react'

export const Route = createFileRoute( '/' )( {
  component : Index,
} )

function Index() {
  const queryClient = useQueryClient()
  // UI state for the toggle. useRef would NOT work here: mutating a ref does
  // not trigger a re-render, so the switch/text would never update. useState
  // re-renders on every change (see the "useState vs useRef" TL;DR).

  const { isPending, error, data } = useGetBulbV1<
    Awaited<ReturnType<typeof getBulbV1>>,
    Error
  >()

  const [isOn, setIsOn] = useState( false )

  // Mirror the authoritative server state into the local toggle when the
  // cached data changes (render-time adjustment — no effect needed).
  const [lastData, setLastData] = useState( data )
  if ( data !== lastData ) {
    setLastData( data )
    if ( data ) setIsOn( data.data?.data?.is_on ?? false )
  }

  const mutation = useSetBulb( {
    mutation : {
      onSuccess : ( _response, variables ) => {
        // Server accepted the new value — commit it to the toggle.
        setIsOn( variables.data.is_on )
        queryClient.invalidateQueries( { queryKey : getGetBulbV1QueryKey() } )
      },
      onError : ( _error, variables ) => {
        // Server rejected the new value — revert to the last known good state.
        // Offline-safe: this is plain local state, so the revert always fires.
        setIsOn( !variables.data.is_on )
      },
    },
  } )

  const handleSwitchChange = ( value: boolean ) => {
    // Flip instantly for a like-button feel, then sync with the server.
    setIsOn( value )
    mutation.mutate( { data : { is_on : value } } )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy">on-off</h1>
      {
        isPending ? (
          <div className='h-4 bg-gray-200 animate-pulse w-20'/>
        ) : !error ? (
          <p className="text-navy-overlay">
            Your bulb is{' '}
            <code className="font-code text-navy-light">
              {isOn ? 'On' : 'Off'}
            </code>
          </p>
        ) : null
      }
      
      <Switch
        enabled={isOn}
        disabled={isPending || mutation.isPending}
        setEnabled={handleSwitchChange}
      />
      {
        ( mutation.error || error ) ? (
          <p className="text-red-500">Something went wrong, please try again later.</p>
        ) : null
      }

      <Link to="/schedule">Schedule</Link>
    </main>
  )
}
