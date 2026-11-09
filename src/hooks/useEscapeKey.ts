import { useEffect, useRef } from 'react'

/**
 * Calls `onEscape` when the Escape key is pressed, only while `enabled` is true.
 */
export function useEscapeKey( enabled: boolean, onEscape: () => void ) {
  // Keep the latest callback without re-binding the listener on every render
  const onEscapeRef = useRef( onEscape )

  useEffect( () => {
    onEscapeRef.current = onEscape
  } )

  useEffect( () => {
    if ( !enabled ) return

    const onKeyDown = ( e: KeyboardEvent ) => {
      if ( e.key === 'Escape' ) onEscapeRef.current()
    }

    window.addEventListener( 'keydown', onKeyDown )

    return () => window.removeEventListener( 'keydown', onKeyDown )
  }, [enabled] )
}
