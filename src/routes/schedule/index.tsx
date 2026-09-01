import { format, isValid } from 'date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { useListSchedules } from '../../api/generated/schedules/schedules'
import type { ApiResponseVecScheduleDataItem } from '../../api/generated/bulbAPI.schemas'

export const Route = createFileRoute( '/schedule/' )( {
  component : RouteComponent,
} )

function RouteComponent() {
  const { isPending, error, data } = useListSchedules()

  const schedules = data?.data?.data ?? []

  return (
    <main className="flex min-h-screen flex-col justify-center items-center gap-4 p-8">
      <h1 className="font-primary text-2xl text-navy">schedule</h1>

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
    </main>
  )
}

function SkeletonList() {
  return (
    <ul className="flex w-full max-w-md justify-center flex-col gap-3 list-none m-0">
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

function ScheduleCard( { schedule }: { schedule: ApiResponseVecScheduleDataItem } ) {
  const updated = new Date( schedule.updated_at )
  const updatedLabel = isValid( updated )
    ? format( updated, 'd MMM yyyy, HH:mm' )
    : schedule.updated_at

  return (
    <li className="w-full rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="h3 font-primary text-navy">{schedule.name}</h2>
        </div>
        <span className={ `rounded-full px-2 py-0.5 text-xs font-semibold ${schedule.action === 'on' ? 'bg-navy text-white' : 'bg-navy/10 text-navy'}` }>
          {schedule.action}
        </span>
      </div>

      <p className="mt-3 font-code text-sm text-navy-light">{schedule.cron_expr}</p>

      <p className="mt-2 text-xs text-navy-overlay">
        Updated {updatedLabel}
      </p>
    </li>
  )
}
