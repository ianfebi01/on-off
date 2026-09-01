import Switch from '@/components/Inputs/Switch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute( '/' )( {
  component : Index,
} )

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
const BULB_URL = `${baseUrl}/bulb`

function Index() {
  const queryClient = useQueryClient()

  const { isPending, error, data } = useQuery( {
    queryKey : ['bulb'],
    queryFn  : () => fetch( BULB_URL ).then( ( res ) => res.json() ),
  } )

  const mutation = useMutation( {
    mutationFn : ( isOn: boolean ) =>
      fetch( BULB_URL, {
        method  : 'PUT',
        headers : { 'Content-Type' : 'application/json' },
        body    : JSON.stringify( { is_on : isOn } ),
      } ).then( ( res ) => res.json() ),
    onSuccess : () => {
      queryClient.invalidateQueries( { queryKey : ['bulb'] } )
    },
  } )

  if ( isPending ) return 'Loading...'

  if ( error ) return 'An error has occurred: ' + error.message

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy">on-off</h1>
      <p className="text-navy-overlay">
        Your bulb is{' '}
        <code className="font-code text-navy-light">
          {data.is_on ? 'On' : 'Off'}
        </code>
      </p>
      <Switch
        enabled={data.is_on}
        setEnabled={( value ) => mutation.mutate( value )}
      />
    </main>
  )
}
