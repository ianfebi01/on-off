import { useState } from 'react'
import { format, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props {
  /** Currently selected day, or undefined when nothing is picked yet. */
  value?: Date
  onChange: ( date: Date | undefined ) => void
  /** Label shown while `value` is empty. */
  placeholder?: string
  /** date-fns pattern used to render the selected day. */
  dateFormat?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export default function DatePicker( {
  value,
  onChange,
  placeholder = 'Pick a date',
  dateFormat = 'd MMM yyyy',
  disabled = false,
  className,
  ariaLabel = 'Pick a date',
}: Props ) {
  const [open, setOpen] = useState( false )

  const hasValue = value !== undefined && isValid( value )

  const handleSelect = ( date: Date | undefined ) => {
    onChange( date )
    setOpen( false )
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          data-name="date-picker"
          className={cn(
            'justify-start font-normal',
            disabled && 'button-disabled',
            !hasValue && 'text-navy-overlay hover:text-white',
            className
          )}
        >
          <CalendarIcon />
          {hasValue ? format( value, dateFormat ) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
