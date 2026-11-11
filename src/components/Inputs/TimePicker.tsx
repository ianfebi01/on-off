import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ClockIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { inputClassName } from './inputStyles'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Props {
  /** Currently selected time as `HH:mm`, or empty when nothing is picked yet. */
  value?: string
  onChange: ( time: string ) => void
  /** Label shown while `value` is empty. */
  placeholder?: string
  disabled?: boolean
  /** id for the trigger button, e.g. so a `<label htmlFor>` can open the picker. */
  id?: string
  className?: string
  ariaLabel?: string
}

const HOURS24 = Array.from( { length : 24 }, ( _, index ) => index )
const MINUTES = Array.from( { length : 60 }, ( _, index ) => index )

const ITEM_HEIGHT = 28
const VISIBLE_COUNT = 5

const pad = ( n: number ) => String( n ).padStart( 2, '0' )

interface WheelProps {
  values: number[]
  selected: number | null
  onSelect: ( value: number ) => void
  ariaLabel?: string
}

/**
 * Vertical scroll-snap list that pins whichever row lands in the middle — no
 * clicks needed. The initial `selected` row is centred on mount; from then on
 * every scroll re-pins the row that settles in the middle.
 */
/** Index (into `values`) of the option nearest the list's vertical centre. */
function closestOptionIndex( list: HTMLUListElement ): number {
  const centerY = list.getBoundingClientRect().top + list.clientHeight / 2
  let closest = -1
  let closestDistance = Infinity

  list.querySelectorAll<HTMLElement>( '[role="option"]' ).forEach( ( option, index ) => {
    const optionCenter = option.getBoundingClientRect().top + option.offsetHeight / 2
    const distance = Math.abs( optionCenter - centerY )
    if ( distance < closestDistance ) {
      closestDistance = distance
      closest = index
    }
  } )

  return closest
}

function Wheel( { values, selected, onSelect, ariaLabel }: WheelProps ) {
  const listRef = useRef<HTMLUListElement>( null )
  const padHeight = ( ( VISIBLE_COUNT - 1 ) / 2 ) * ITEM_HEIGHT
  const pendingDelta = useRef( 0 )
  const frameId = useRef<number | null>( null )
  const settleId = useRef<number | null>( null )

  // Centre the initial `selected` row on mount.
  useEffect( () => {
    const list = listRef.current
    if ( !list || selected === null ) return
    const options = list.querySelectorAll<HTMLElement>( '[role="option"]' )
    const option = options[ values.indexOf( selected ) ]
    if ( !option ) return

    const optionCenter = option.getBoundingClientRect().top + option.offsetHeight / 2
    const listCenter = list.getBoundingClientRect().top + list.clientHeight / 2
    list.scrollTop += optionCenter - listCenter
    // eslint-disable-next-line react-hooks/exhaustive-deps -- centre on mount only
  }, [] )

  // Native wheel scrolling is suppressed inside a modal dialog (scroll-lock),
  // so scroll the list ourselves. Deltas are applied once per animation frame,
  // which reads like smooth, native scrolling.
  useEffect( () => {
    const list = listRef.current
    if ( !list ) return

    const flush = () => {
      frameId.current = null
      const delta = pendingDelta.current
      pendingDelta.current = 0
      if ( delta === 0 ) return
      const max = list.scrollHeight - list.clientHeight
      list.scrollTop = Math.min( Math.max( list.scrollTop + delta, 0 ), max )
    }

    const handleWheel = ( event: WheelEvent ) => {
      event.preventDefault()
      pendingDelta.current += event.deltaY
      if ( frameId.current === null ) {
        frameId.current = requestAnimationFrame( flush )
      }
    }

    list.addEventListener( 'wheel', handleWheel, { passive : false } )

    return () => {
      list.removeEventListener( 'wheel', handleWheel )
      if ( frameId.current !== null ) cancelAnimationFrame( frameId.current )
      if ( settleId.current !== null ) window.clearTimeout( settleId.current )
    }
  }, [] )

  // Ease the pinned row back to the exact centre once scrolling has settled.
  const settleToCentre = ( list: HTMLUListElement ) => {
    settleId.current = null
    const index = closestOptionIndex( list )
    const option = list.querySelectorAll<HTMLElement>( '[role="option"]' )[ index ]
    if ( !option ) return

    const optionCenter = option.getBoundingClientRect().top + option.offsetHeight / 2
    const listCenter = list.getBoundingClientRect().top + list.clientHeight / 2
    const offset = optionCenter - listCenter
    if ( Math.abs( offset ) > 1 ) {
      list.scrollTo( { top : list.scrollTop + offset, behavior : 'smooth' } )
    }
  }

  // Pin whichever row is closest to the middle of the list while scrolling.
  const handleScroll = () => {
    const list = listRef.current
    if ( !list ) return
    const index = closestOptionIndex( list )
    const value = values[ index ]
    if ( value !== undefined && value !== selected ) {
      onSelect( value )
    }

    if ( settleId.current !== null ) window.clearTimeout( settleId.current )
    settleId.current = window.setTimeout( () => settleToCentre( list ), 120 )
  }

  return (
    <div className="relative w-9">
      <ul
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        style={ { height : VISIBLE_COUNT * ITEM_HEIGHT } }
        className="overscroll-contain overflow-y-auto scrollbar-none flex flex-col p-0 m-0 list-none select-none"
      >
        <li
          aria-hidden
          className="shrink-0"
          style={ { height : padHeight } }
        />
        {values.map( ( v ) => {
          const active = v === selected

          return (
            <li
              key={v}
              role="option"
              aria-selected={active}
              style={ { height : ITEM_HEIGHT } }
              className={ cn(
                'flex shrink-0 items-center justify-center font-medium text-sm',
                active ? 'text-navy-light' : 'text-navy/25'
              ) }
            >
              {pad( v )}
            </li>
          )
        } ) }
        <li
          aria-hidden
          className="shrink-0"
          style={ { height : padHeight } }
        />
      </ul>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-linear-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-linear-to-t from-white to-transparent" />
    </div>
  )
}

export default function TimePicker( {
  value,
  onChange,
  placeholder = 'Pick a time',
  disabled = false,
  id,
  className,
  ariaLabel = 'Pick a time',
}: Props ) {
  const [ open, setOpen ] = useState( false )
  const [ hour, setHour ] = useState<number | null>( null )
  const [ minute, setMinute ] = useState<number | null>( null )

  const hasValue = value !== undefined && value !== ''

  const handleOpenChange = ( next: boolean ) => {
    if ( next ) {
      if ( value !== undefined && value !== '' ) {
        const [ h, m ] = value.split( ':' ).map( Number )
        setHour( h )
        setMinute( m )
      } else {
        const now = new Date()
        setHour( now.getHours() )
        setMinute( now.getMinutes() )
      }
    }
    setOpen( next )
  }

  const handleDone = () => {
    if ( hour !== null && minute !== null ) {
      onChange( `${pad( hour )}:${pad( minute )}` )
    }
    setOpen( false )
  }

  const handleClear = () => {
    onChange( '' )
    setOpen( false )
  }

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          data-name="time-picker"
          className={ cn(
            inputClassName,
            'flex items-center gap-2 w-54',
            value ? 'text-navy' : 'text-navy-overlay',
            className,
          ) }
        >
          <ClockIcon className='size-4'/>
          {hasValue ? value : placeholder}
          <ChevronDown className={cn(
            'transition-all duration-150 ease-in-out ml-auto size-4',
            open && '-rotate-180',
          )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <div className="flex items-center justify-center gap-1 px-3 py-1.5">
          <Wheel
            values={HOURS24}
            selected={hour}
            onSelect={setHour}
            ariaLabel="Hour"
          />
          <span className="font-semibold text-navy-light text-base">:</span>
          <Wheel
            values={MINUTES}
            selected={minute}
            onSelect={setMinute}
            ariaLabel="Minute"
          />
        </div>
        <div className="flex items-center justify-end gap-1 border-t border-navy/10 px-2 py-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-navy-overlay hover:text-navy active:text-navy"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={handleDone}
            disabled={hour === null || minute === null}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
