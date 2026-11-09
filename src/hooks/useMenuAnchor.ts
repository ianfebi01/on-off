import { useCallback, useEffect, useRef, useState } from 'react'

export interface MenuAnchorType {
  top: number
  right: number
  width: number
  height: number
}

/**
 * Tracks the viewport position of a menu trigger so a fixed panel can be anchored to it.
 * Re-measures on element resize and window resize.
 */
export function useMenuAnchor<T extends HTMLElement = HTMLDivElement>() {
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchorType | null>( null )
  const menuTriggerRef = useRef<T>( null )

  const syncMenuAnchor = useCallback( () => {
    if ( !menuTriggerRef.current ) return

    // The trigger is a padded hover zone (p-4 -m-4); measure its content box so the
    // panel lines up with the visible button rather than the invisible padding
    const zone = menuTriggerRef.current
    const rect = zone.getBoundingClientRect()
    const style = window.getComputedStyle( zone )
    const paddingTop = parseFloat( style.paddingTop )
    const paddingRight = parseFloat( style.paddingRight )
    const paddingBottom = parseFloat( style.paddingBottom )
    const paddingLeft = parseFloat( style.paddingLeft )

    setMenuAnchor( {
      top    : rect.top + paddingTop,
      right  : window.innerWidth - rect.right + paddingRight,
      width  : rect.width - paddingLeft - paddingRight,
      height : rect.height - paddingTop - paddingBottom,
    } )
  }, [] )

  useEffect( () => {
    syncMenuAnchor()

    if ( !menuTriggerRef.current ) return

    const resizeObserver = new ResizeObserver( syncMenuAnchor )

    resizeObserver.observe( menuTriggerRef.current )
    window.addEventListener( 'resize', syncMenuAnchor )

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener( 'resize', syncMenuAnchor )
    }
  }, [syncMenuAnchor] )

  return { menuAnchor, menuTriggerRef }
}
