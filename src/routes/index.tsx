import Switch from '@/components/Inputs/Switch'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getBulb, getGetBulbQueryKey, useGetBulb, useSetBulb } from '../api/generated/bulb/bulb'

export const Route = createFileRoute( '/' )( {
  component : Index,
} )

function Index() {
  const queryClient = useQueryClient()

  const { isPending, error, data } = useGetBulb<Awaited<ReturnType<typeof getBulb>>, Error>()

  const mutation = useSetBulb( {
    mutation : {
      onSuccess : () => {
        queryClient.invalidateQueries( { queryKey : getGetBulbQueryKey() } )
      },
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
          {data?.data?.is_on ? 'On' : 'Off'}
        </code>
      </p>
      <Switch
        enabled={data?.data?.is_on || false}
        setEnabled={( value ) => mutation.mutate( { data : { is_on : value } } )}
      />
    </main>
  )
}
