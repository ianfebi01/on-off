import { createFileRoute } from '@tanstack/react-router'
import { useListSchedules } from '../../api/generated/schedules/schedules'
import Button from '../../components/Buttons/Button'
import ScheduleCard from '../../components/Schedule/ScheduleCard'
import { ClockIcon } from 'lucide-react'

export const Route = createFileRoute( '/schedule/' )( {
  component : RouteComponent,
} )

function RouteComponent() {
  const { isPending, error, data } = useListSchedules()

  const schedules = data?.data?.data ?? []

  return (
    <main className="flex flex-col items-start gap-4">
      <nav className='max-w-7xl mx-auto w-full p-4 flex justify-between items-center'>
        <h1 className="font-primary text-2xl text-navy">schedule</h1>
        <Button ariaLabel="Add Schedule"
          variant='secondary'
        > <ClockIcon/> Add Schedule</Button>
      </nav>
      <div className='container'>

        { isPending ? (
          <SkeletonList />
        ) : error ? (
          <p className="text-red-500">Something went wrong, please try again later.</p>
        ) : schedules.length === 0 ? (
          <p className="text-navy-overlay">No schedules yet.</p>
        ) : (
          <ul className="flex w-full max-w-md flex-col gap-3 list-none m-0">
            { schedules.map( ( schedule ) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
              />
            ) ) }
          </ul>
        ) }
      </div>
    </main>
  )
}

function SkeletonList() {
  return (
    <ul className="flex w-full max-w-md flex-col gap-3 list-none m-0">
      { Array.from( { length : 3 } ).map( ( _, index ) => (
        <li
          key={index}
          className="w-full rounded-xl border border-navy/10 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="mt-3 h-3 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
        </li>
      ) ) }
    </ul>
  )
}
