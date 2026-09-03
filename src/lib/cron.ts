/**
 * Parse a 5- or 6-field cron expression into a short human-readable label,
 * e.g. `"30 7 * * 1-5"` → `"Weekdays at 07:30"`.
 *
 * Both common field layouts are accepted:
 *   5-field: minute hour day-of-month month day-of-week
 *   6-field: SECOND minute hour day-of-month month day-of-week
 *            (seconds-first, as used by tokio-scheduler)
 *
 * Field ranges:
 *   second/minute 0-59 · hour 0-23 · day-of-month 1-31 · month 1-12 (or
 *   JAN-DEC) · day-of-week 0-7 (0 and 7 are Sunday, or SUN-SAT)
 *
 * Supported value syntax per field: `*` (any value), step ranges such as
 * `0-30/5`, named ranges, and comma-separated lists like `1,15`. When a
 * pattern is valid but too exotic to describe confidently, `describeCron`
 * returns `null` so callers can fall back to showing the raw expression.
 */

const DOW_NAMES = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const MONTH_INDEX: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}
const DOW_INDEX: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

const pad = ( n: number ) => String( n ).padStart( 2, '0' )

/** Replace English month/day names with numbers inside a raw field string. */
function replaceNames( field: string, index: Record<string, number> ): string {
  const lower = field.toLowerCase()
  return Object.keys( index ).reduce(
    ( acc, name ) => acc.replace( new RegExp( name, 'g' ), String( index[name] ) ),
    lower,
  )
}

/**
 * Expand a cron field into the sorted, unique set of numbers it matches.
 * Returns `null` when the field can't be parsed.
 */
function expandField(
  raw: string,
  min: number,
  max: number,
  names?: Record<string, number>,
): number[] | null {
  const field = names ? replaceNames( raw, names ) : raw
  const out = new Set<number>()

  for ( const item of field.split( ',' ) ) {
    if ( item === '' ) return null

    const stepMatch = /^(.+)\/(\d+)$/.exec( item )
    const step = stepMatch ? Number( stepMatch[2] ) : 1
    const base = stepMatch ? stepMatch[1] : item

    let lo: number
    let hi: number
    if ( base === '*' ) {
      lo = min
      hi = max
    } else {
      const rangeMatch = /^(\d+)(?:-(\d+))?$/.exec( base )
      if ( !rangeMatch ) return null
      lo = Number( rangeMatch[1] )
      if ( rangeMatch[2] ) {
        hi = Number( rangeMatch[2] )
      } else if ( stepMatch ) {
        // A bare value with a step (`5/15`) runs to the end of the field.
        hi = max
      } else {
        hi = lo // a single fixed value
      }
    }

    if ( lo < min || hi > max || step < 1 || lo > hi ) return null
    for ( let v = lo; v <= hi; v += step ) out.add( v )
  }

  return [ ...out ].filter( ( v ) => v >= min && v <= max ).sort( ( a, b ) => a - b )
}

/** Day-of-week is 0-7 where 7 is Sunday; normalise to 0-6. */
function normalizeDow( values: number[] | null ): number[] | null {
  if ( !values ) return null
  const set = new Set( values.map( ( v ) => ( v === 7 ? 0 : v ) ) )
  return [ ...set ].sort( ( a, b ) => a - b )
}

/** For a sorted ascending array, return its constant step (null if irregular). */
function progressionStep( sorted: number[] ): number | null {
  if ( sorted.length < 2 ) return null
  const step = sorted[1] - sorted[0]
  if ( step <= 0 ) return null
  for ( let i = 2; i < sorted.length; i++ ) {
    if ( sorted[i] - sorted[i - 1] !== step ) return null
  }
  return step
}

/**
 * True when the values form an even step starting at the field minimum and
 * spanning as far as the field allows (e.g. minutes `0, 30` from a step of 30).
 */
function coversFull( values: number[], min: number, max: number ): boolean {
  const step = progressionStep( values )
  if ( step === null ) return false
  return values[0] === min &&
    values.length === Math.floor( ( max - min ) / step ) + 1
}

function ordinal( n: number ): string {
  const s = [ 'th', 'st', 'nd', 'rd' ]
  const v = n % 100
  return `${n}${s[( v - 20 ) % 10] ?? s[v] ?? s[0]}`
}

/** Join with "&" / Oxford commas: `[a, b, c]` → `a, b & c`. */
function joinList( items: string[] ): string {
  if ( items.length <= 1 ) return items.join( '' )
  if ( items.length === 2 ) return items.join( ' & ' )
  return `${items.slice( 0, -1 ).join( ', ' )} & ${items[items.length - 1]}`
}

function toTime( hour: number, minute: number, second?: number ): string {
  return second === undefined
    ? `${pad( hour )}:${pad( minute )}`
    : `${pad( hour )}:${pad( minute )}:${pad( second )}`
}

type When = { text: string; kind: 'time' | 'freq' } | null

/**
 * Describe the second/minute/hour part of the schedule.
 * `kind: 'time'` means concrete clock times ("at 07:30"); `kind: 'freq'`
 * means a repeating interval ("every 30 minutes"). A 5-field expression is
 * passed in with `seconds = [0]`.
 */
function describeWhen(
  seconds: number[],
  minutes: number[],
  hours: number[],
): When {
  const secondAll = seconds.length === 60
  const minuteAll = minutes.length === 60
  const hourAll = hours.length === 24

  // A single non-zero second worth showing on a concrete time (`10:40:30`).
  const secondOffset =
    !secondAll && seconds.length === 1 && seconds[0] !== 0
      ? seconds[0]
      : undefined

  // Every second, or regular sub-minute intervals (`every 10 seconds`).
  if ( minuteAll && hourAll ) {
    if ( secondAll ) return { kind: 'freq', text: 'every second' }
    if ( coversFull( seconds, 0, 59 ) ) {
      const step = seconds[1] - seconds[0]
      return { kind: 'freq', text: `every ${step} seconds` }
    }
    if ( seconds.length === 1 ) {
      return {
        kind: 'freq',
        text: seconds[0] === 0
          ? 'every minute'
          : `every minute at ${seconds[0]} seconds past`,
      }
    }
    return null
  }

  // At minute/hour granularity, a second field only makes sense as a single
  // fixed offset; any other seconds pattern is left as the raw expression.
  if ( !secondAll && seconds.length > 1 ) return null

  // Minutes restricted, every hour of the day.
  if ( hourAll ) {
    const mStep = progressionStep( minutes )
    if ( coversFull( minutes, 0, 59 ) ) {
      return {
        kind: 'freq',
        text: mStep === 1 ? 'every minute' : `every ${mStep} minutes`,
      }
    }
    if ( minutes.length === 1 ) {
      const m = minutes[0]
      return {
        kind: 'freq',
        text: m === 0
          ? 'every hour on the hour'
          : `every hour at ${pad( m )} minutes past`,
      }
    }
    if ( minutes.length <= 3 ) {
      const parts = minutes.map( ( m ) =>
        m === 0 ? 'on the hour' : `${pad( m )} minutes past`,
      )
      return { kind: 'freq', text: `${joinList( parts )} of each hour` }
    }
    return null
  }

  // A single minute at a restricted set of hours.
  if ( minutes.length === 1 ) {
    const m = minutes[0]
    if ( coversFull( hours, 0, 23 ) && hours[0] === 0 ) {
      const hStep = hours[1] - hours[0]
      return {
        kind: 'freq',
        text: m === 0
          ? `every ${hStep} hours`
          : `every ${hStep} hours at ${pad( m )} minutes past`,
      }
    }
    if ( hours.length <= 8 ) {
      return {
        kind: 'time',
        text: `at ${joinList( hours.map( ( h ) => toTime( h, m, secondOffset ) ) )}`,
      }
    }
    return null
  }

  // Both fields restricted — accept only a small set of concrete times.
  const combos: string[] = []
  for ( const h of hours ) {
    for ( const m of minutes ) combos.push( toTime( h, m, secondOffset ) )
  }
  if ( combos.length <= 8 ) return { kind: 'time', text: `at ${joinList( combos )}` }
  return null
}

/**
 * Describe the day/month part as a leading subject:
 * `""`, `"Every day"`, `"Weekdays"`, `"Mon–Fri"`, `"On the 1st"`, etc.
 */
function describeDays(
  doms: number[],
  months: number[],
  dows: number[],
): string | null {
  const domAll = doms.length === 31
  const monthAll = months.length === 12
  const dowAll = dows.length === 7

  // If both day-of-month and day-of-week are restricted, standard cron runs
  // when EITHER matches — too ambiguous to describe. Bail out.
  if ( !domAll && !dowAll ) return null

  const monthsLabel = monthAll ? null
    : joinList( months.map( ( m ) => MONTH_NAMES[m - 1] ) )

  // Day-of-month restricted.
  if ( !domAll ) {
    if ( monthsLabel ) {
      if ( doms.length <= 4 && !coversFull( doms, 1, 31 ) ) {
        return `on the ${joinList( doms.map( ordinal ) )} of ${monthsLabel}`
      }
      return null
    }
    if ( coversFull( doms, 1, 31 ) ) {
      const step = doms[1] - doms[0]
      if ( step > 1 ) return `every ${step} days`
    }
    if ( doms.length <= 4 ) {
      return `on the ${joinList( doms.map( ordinal ) )}`
    }
    return null
  }

  // Day-of-week restricted.
  if ( !dowAll ) {
    if ( monthsLabel ) return null
    const isWeekdays = dows.length === 5 && dows[0] === 1 && dows[4] === 5 &&
      progressionStep( dows ) === 1
    if ( isWeekdays ) return 'Weekdays'
    if ( dows.length === 2 && ( dows[0] === 0 && dows[1] === 6 ) ) return 'Weekends'
    if ( dows.length === 1 ) return `every ${DOW_NAMES[dows[0]]}`
    if ( progressionStep( dows ) === 1 ) {
      return `${DOW_NAMES[dows[0]]}–${DOW_NAMES[dows[dows.length - 1]]}`
    }
    if ( dows.length <= 5 ) {
      return joinList( dows.map( ( d ) => DOW_NAMES[d] ) )
    }
    return null
  }

  if ( monthsLabel ) return `in ${monthsLabel}`
  return '' // runs every day
}

/**
 * Turn a 5- or 6-field cron expression into a short, readable label such as
 * `"Every day at 07:30"`, `"Weekdays at 08:00"` or `"Every 15 minutes"`.
 *
 * @returns A label, or `null` when the expression is invalid or too complex to
 *   summarise — callers should fall back to the raw expression.
 */
export function describeCron( cronExpr: string ): string | null {
  let parts = cronExpr.trim().split( /\s+/ )
  // Normalise a 5-field expression (no seconds) to the 6-field shape.
  if ( parts.length === 5 ) parts = [ '0', ...parts ]
  if ( parts.length !== 6 ) return null
  const [ sRaw, mRaw, hRaw, domRaw, monRaw, dowRaw ] = parts

  const seconds = expandField( sRaw, 0, 59 )
  const minutes = expandField( mRaw, 0, 59 )
  const hours = expandField( hRaw, 0, 23 )
  const doms = expandField( domRaw, 1, 31 )
  const months = expandField( monRaw, 1, 12, MONTH_INDEX )
  const dows = normalizeDow( expandField( dowRaw, 0, 7, DOW_INDEX ) )
  if ( !seconds || !minutes || !hours || !doms || !months || !dows ) return null

  const when = describeWhen( seconds, minutes, hours )
  if ( !when ) return null

  const days = describeDays( doms, months, dows )
  if ( days === null ) return null

  let text: string
  if ( days !== '' ) {
    // Frequency labels read better separated by a comma ("Weekdays, every 30
    // minutes"); concrete times don't ("Weekdays at 08:30").
    text = when.kind === 'freq'
      ? `${days}, ${when.text}`
      : `${days} ${when.text}`
  } else if ( when.kind === 'time' ) {
    text = `every day ${when.text}`
  } else {
    text = when.text
  }

  return text.charAt( 0 ).toUpperCase() + text.slice( 1 )
}
