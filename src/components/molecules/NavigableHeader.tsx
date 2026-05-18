import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import MenuButton from '@/components/atoms/headerButtons/MenuButton'
import CloseButton from '@/components/atoms/headerButtons/CloseButton'
import styles from './NavigableHeader.module.css'

export interface NavItem {
  label: string
  to?: string
  onClick?: () => void
  variant?: 'danger'
}

interface Props {
  label: string
  navItems?: NavItem[]
}

export default function NavigableHeader({ label, navItems = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.headerRow}>
        <h1 className={styles.label}>{label}</h1>
        {isOpen
          ? <CloseButton onClick={() => setIsOpen(false)} aria-controls="nav-drawer" />
          : <MenuButton onClick={() => setIsOpen(true)} aria-expanded={false} aria-controls="nav-drawer" />
        }
        {isOpen && (
          <>
            <div
              className={styles.backdrop}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <nav
              id="nav-drawer"
              className={styles.drawer}
              aria-label="Navigation menu"
            >
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className={`${styles.navLink}${item.variant === 'danger' ? ` ${styles.navLinkDanger}` : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.navLink}${item.variant === 'danger' ? ` ${styles.navLinkDanger}` : ''}`}
                        onClick={() => {
                          item.onClick?.()
                          setIsOpen(false)
                        }}
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </div>
    </div>
  )
}
