import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { SaveCheckIcon } from 'lucide-react'
import {
  getListSchedulesQueryKey,
  useCreateSchedule,
} from '@/api/generated/schedules/schedules'
import Button from '@/components/Buttons/Button'
import Switch from '@/components/Inputs/Switch'
import TimePicker from '@/components/Inputs/TimePicker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  buildDailyCron,
  describeCron,
  parseDailyCronTime,
} from '@/lib/cron'

interface Props {
  open: boolean
  onOpenChange: ( open: boolean ) => void
}

const schema = z.object( {
  action    : z.string().min( 1, { message : 'Action is required' } ),
  cron_expr : z.string().min( 1, { message : 'Pick a time' } ),
  name      : z.string().min( 1, { message : 'Name is required' } ),
} )

type FormValues = z.infer<typeof schema>

const inputClassName =
  'transition-all duration-200 ease-in-out h-10 p-2 rounded-lg border border-navy/25 outline-none focus:ring-2 focus:outline-0 focus:ring-blue-400 placeholder:text-navy-overlay text-navy text-sm w-full'

const labelClassName = 'text-sm font-medium text-navy'

export default function AddScheduleModal( { open, onOpenChange }: Props ) {
  const queryClient = useQueryClient()
  const mutation = useCreateSchedule()
  const [ submitError, setSubmitError ] = useState<string | null>( null )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>( {
    resolver      : zodResolver( schema ),
    defaultValues : { action : 'on', cron_expr : '', name : '' },
  } )

  useEffect( () => {
    if ( open ) reset()
  }, [ open, reset ] )

  const onSubmit = async ( data: FormValues ) => {
    setSubmitError( null )
    try {
      const response = await mutation.mutateAsync( { data } )
      if ( response.status !== 200 ) {
        setSubmitError( 'Could not create the schedule. Please try again.' )
        
        return
      }
      await queryClient.invalidateQueries( {
        queryKey : getListSchedulesQueryKey(),
      } )
      onOpenChange( false )
    } catch {
      setSubmitError( 'Something went wrong, please try again later.' )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Schedule</DialogTitle>
          <DialogDescription>
            Turn the light on or off at a time of day.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit( onSubmit )}
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className={labelClassName}
            >
              Name
            </label>
            <input
              {...register( 'name' )}
              placeholder="Name"
              id="name"
              className={inputClassName}
            />
            {errors.name?.message ? (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cron_expr"
              className={labelClassName}
            >
              Cron Expression
            </label>
            <Controller
              control={control}
              name="cron_expr"
              render={ ( { field } ) => (
                <>
                  <TimePicker
                    id="cron_expr"
                    value={
                      field.value
                        ? parseDailyCronTime( field.value ) ?? undefined
                        : undefined
                    }
                    onChange={ ( time ) => {
                      if ( time ) {
                        const [ hour, minute ] = time.split( ':' ).map( Number )
                        field.onChange( buildDailyCron( hour, minute ) )
                      } else {
                        field.onChange( '' )
                      }
                    } }
                    placeholder="Pick a time"
                    ariaLabel="Pick a time"
                    className={inputClassName}
                  />
                  {field.value ? (
                    <p className="text-xs text-navy-overlay">
                      {describeCron( field.value ) ?? (
                        <span className="font-code">{field.value}</span>
                      )}
                    </p>
                  ) : null}
                  {errors.cron_expr?.message ? (
                    <p className="text-sm text-red-500">
                      {errors.cron_expr.message}
                    </p>
                  ) : null}
                </>
              ) }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="action"
              className={labelClassName}
            >
              Action
            </label>
            <Controller
              control={control}
              name="action"
              render={ ( { field } ) => (
                <div className="flex items-center gap-2">
                  <Switch
                    enabled={field.value === 'on'}
                    disabled={false}
                    setEnabled={ ( checked ) => field.onChange( checked ? 'on' : 'off' ) }
                  />
                  <span className="text-navy">
                    {field.value === 'on' ? 'On' : 'Off'}
                  </span>
                </div>
              ) }
            />
          </div>

          {submitError ? (
            <p className="text-sm text-red-500">{submitError}</p>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={ () => onOpenChange( false ) }
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
            >
              {' '}
              <SaveCheckIcon /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
