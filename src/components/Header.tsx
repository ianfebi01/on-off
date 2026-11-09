import { Link } from '@tanstack/react-router'
import Button from './Buttons/Button'
import { EllipsisIcon } from 'lucide-react'
import { useState } from 'react'
import HeaderPanel from './HeaderPanel'
import { useMenuAnchor } from '@/hooks/useMenuAnchor'
import { useEscapeKey } from '@/hooks/useEscapeKey'

const Header = () => {
  const [isOpen, setIsOpen] = useState( false )
  const { menuAnchor, menuTriggerRef } = useMenuAnchor()

  useEscapeKey( isOpen, () => setIsOpen( false ) )

  return (
    <nav className="max-w-7xl mx-auto w-full p-4 flex justify-between items-center border-b border-navy/10 mb-2">
      <div className="flex items-center gap-4">
        <Link to="/"
          className="no-underline"
        >
          <h1 className="font-primary text-2xl text-navy">on-off</h1>
        </Link>
      </div>
      <div ref={menuTriggerRef}>
        <Button variant="icon"
          onClick={() => setIsOpen( true )}
        >
          <EllipsisIcon />
        </Button>
      </div>
      <HeaderPanel
        isOpen={isOpen}
        menuAnchor={menuAnchor}
        setIsOpen={setIsOpen}
      />
    </nav>
  )
}

export default Header
