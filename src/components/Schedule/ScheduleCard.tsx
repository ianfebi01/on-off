import { format, isValid } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import type { ApiResponseVecScheduleDataItem } from '@/api/generated/bulbAPI.schemas'
import { describeCron } from '@/lib/cron'

interface ScheduleCardProps {
  schedule: ApiResponseVecScheduleDataItem
  onEdit?: () => void
  onDelete?: () => void
}

export default function ScheduleCard( { schedule, onEdit, onDelete }: ScheduleCardProps ) {
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

      <p
        className="mt-3 text-sm text-navy-light"
        title={schedule.cron_expr}
      >
        {describeCron( schedule.cron_expr ) ?? <span className="font-code">{schedule.cron_expr}</span>}
      </p>

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-navy-overlay">
          Updated {updatedLabel}
        </p>
        <div className="flex items-center gap-1">
          {onEdit ? (
            <button
              type="button"
              aria-label={ `Edit ${schedule.name}` }
              onClick={onEdit}
              className="rounded-md p-1.5 text-navy-overlay transition-colors hover:bg-navy/10 hover:text-navy"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              aria-label={ `Delete ${schedule.name}` }
              onClick={onDelete}
              className="rounded-md p-1.5 text-navy-overlay transition-colors hover:bg-navy/10 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}
