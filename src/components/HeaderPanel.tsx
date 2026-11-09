'use client'

import { cn } from '@/lib/utils'
import type { MenuAnchorType } from '@/hooks/useMenuAnchor'
import Button from './Buttons/Button'
import { ArrowRight, LogIn, LogOut, X } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/useAuth'

interface Props {
  isOpen: boolean
  menuAnchor: MenuAnchorType | null
  setIsOpen: ( value: boolean ) => void
}

const HeaderPanel = ( { isOpen, menuAnchor, setIsOpen }: Props ) => {
  const { user, logout } = useAuth()

  const navigate = useNavigate()

  const handleLogin = () => {
    navigate( { to : '/login' } )
    setIsOpen( false )
  }
  // Wrap the panel around the menu button with a small inset so the X sits inside its corner
  const PANEL_INSET = 8
  const panelTop = menuAnchor ? Math.max( menuAnchor.top - PANEL_INSET, 4 ) : 16
  const panelRight = menuAnchor
    ? Math.max( menuAnchor.right - PANEL_INSET, 4 )
    : 16
  const panelMaxHeight = `calc(100dvh - ${panelTop}px - 16px)`

  // Grow the panel out of the button's centre
  const transformOrigin = menuAnchor
    ? `calc(100% - ${menuAnchor.right - panelRight + menuAnchor.width / 2}px) ${menuAnchor.top - panelTop + menuAnchor.height / 2}px`
    : 'top right'

  const itemClasses = cn(
    'font-primary text-2xl text-navy no-underline rounded-lg w-full group flex item-center justify-between hover:text-navy-light',
  )

  const arrowClasses = cn(
    'ml-auto self-center size-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-200 text-navy-light',
  )

  return (
    <div
      className={cn(
        'fixed inset-0 z-80 transition-all duration-500',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      id="site-menu"
      // Keep the closed panel out of the tab order and the accessibility tree
      inert={!isOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => setIsOpen( false )}
        aria-hidden="true"
      />

      <div
        className={cn(
          'absolute w-[calc(100vw-1rem)] sm:w-full sm:max-w-md bg-white dark:bg-dark border border-black/10 dark:border-white/10 shadow-2xl py-6 px-4 sm:px-6 overflow-y-auto flex flex-col h-fit rounded-3xl transition-all',
          isOpen
            ? 'scale-100 opacity-100 duration-500 ease-bounce'
            : 'scale-0 opacity-0 duration-300 ease-out',
        )}
        style={{
          top             : `${panelTop}px`,
          right           : `${panelRight}px`,
          maxHeight       : panelMaxHeight,
          transformOrigin : transformOrigin,
        }}
      >

        {/* Navigation */}
        <div
          className={cn(
            'flex flex-col transition-opacity duration-300 text-black',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Button
            variant="icon"
            className="bg-gray-100 absolute top-4 sm:top-6 right-4 sm:right-6"
            onClick={() => setIsOpen( false )}
          >
            <X className="size-4" />
          </Button>

          {!!user && (
            <div aria-label="Menu"
              className="flex flex-col gap-2 mt-10"
            >
              <Link
                to="/"
                className={itemClasses}
                onClick={() => setIsOpen( false )}
              >
                on-ff
                <ArrowRight aria-hidden="true"
                  className={arrowClasses}
                />
              </Link>
              <Link
                to="/schedule"
                className={itemClasses}
                onClick={() => setIsOpen( false )}
              >
                schedule
                <ArrowRight aria-hidden="true"
                  className={arrowClasses}
                />
              </Link>
            </div>
          )}

          {/* User Info */}
          <div
            className={cn(
              'flex items-center justify-between gap-4 mt-8 pt-4 border-t border-navy/10',
              !user && 'border-none mt-12'
            )}
          >
            <div className="flex gap-4 items-center">
              <div
                className={cn(
                  'rounded-full aspect-square size-10 bg-gray-100 text-navy/25 flex items-center justify-center',
                )}
              >
                {user?.username.charAt( 0 ).toUpperCase() || '?'}
              </div>
              <span className="text-base text-navy">
                {user?.username || 'Sign in to continue'}
              </span>
            </div>
            {!user && (
              <Button
                variant="icon"
                className="bg-gray-100"
                onClick={() => handleLogin()}
              >
                <LogIn className="size-3 text-navy" />
              </Button>
            )}
            {!!user && (
              <Button
                variant="icon"
                className="bg-red-50"
                onClick={() => {
                  logout()
                  setIsOpen( false )
                }}
              >
                <LogOut className="size-3 text-navy" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderPanel
