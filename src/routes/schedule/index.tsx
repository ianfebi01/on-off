import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  getListSchedulesQueryKey,
  useDeleteSchedule,
  useListSchedules,
} from '../../api/generated/schedules/schedules'
import type { ApiResponseVecScheduleDataItem } from '../../api/generated/bulbAPI.schemas'
import Button from '../../components/Buttons/Button'
import ScheduleCard from '../../components/Schedule/ScheduleCard'
import ScheduleFormModal from '../../components/Schedule/ScheduleFormModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { ClockIcon } from 'lucide-react'

type ScheduleItem = ApiResponseVecScheduleDataItem

export const Route = createFileRoute( '/schedule/' )( {
  component : RouteComponent,
} )

function RouteComponent() {
  const queryClient = useQueryClient()
  const { isPending, error, data } = useListSchedules()
  const deleteMutation = useDeleteSchedule()

  const [ formOpen, setFormOpen ] = useState( false )
  const [ editingSchedule, setEditingSchedule ] = useState<ScheduleItem | null>( null )
  const [ deleteTarget, setDeleteTarget ] = useState<ScheduleItem | null>( null )
  const [ deleteError, setDeleteError ] = useState<string | null>( null )

  const schedules = data?.data?.data ?? []

  const openAdd = () => {
    setEditingSchedule( null )
    setFormOpen( true )
  }

  const openEdit = ( schedule: ScheduleItem ) => {
    setEditingSchedule( schedule )
    setFormOpen( true )
  }

  const closeForm = () => {
    setEditingSchedule( null )
    setFormOpen( false )
  }

  const askDelete = ( schedule: ScheduleItem ) => {
    setDeleteError( null )
    setDeleteTarget( schedule )
  }

  const confirmDelete = async () => {
    if ( !deleteTarget ) return
    setDeleteError( null )
    try {
      const response = await deleteMutation.mutateAsync( { id : deleteTarget.id } )
      if ( response.status !== 200 ) {
        setDeleteError( 'Could not delete the schedule. Please try again.' )
        
        return
      }
      await queryClient.invalidateQueries( { queryKey : getListSchedulesQueryKey() } )
      setDeleteTarget( null )
    } catch {
      setDeleteError( 'Something went wrong, please try again later.' )
    }
  }

  return (
    <main className="flex flex-col items-start gap-4">
      <nav className='max-w-7xl mx-auto w-full p-4 flex justify-between items-center'>
        <h1 className="font-primary text-2xl text-navy">schedule</h1>
        <Button ariaLabel="Add Schedule"
          variant='primary'
          onClick={openAdd}
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
                onEdit={ () => openEdit( schedule ) }
                onDelete={ () => askDelete( schedule ) }
              />
            ) ) }
          </ul>
        ) }
      </div>

      <ScheduleFormModal
        open={formOpen}
        schedule={editingSchedule ?? undefined}
        onOpenChange={ ( next ) => {
          if ( !next ) closeForm() 
        } }
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={ ( next ) => {
          if ( !next ) setDeleteTarget( null ) 
        } }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete schedule?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{deleteTarget?.name}". This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <p className="text-sm text-red-500">{deleteError}</p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={ () => setDeleteTarget( null ) }
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="error"
              loading={deleteMutation.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
