import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import MenuButton from '@/components/atoms/headerButtons/MenuButton'
import CloseButton from '@/components/atoms/headerButtons/CloseButton'
import styles from './NavigableHeader.module.css'

type LinkNavItem   = { label: string; to: string;          variant?: 'danger' | 'success'; disabled?: boolean }
type ActionNavItem = { label: string; onClick: () => void; variant?: 'danger' | 'success'; disabled?: boolean; subtitle?: string }
export type NavItem = LinkNavItem | ActionNavItem

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
          ? <CloseButton onClick={() => setIsOpen(false)} aria-expanded={isOpen} aria-controls="nav-drawer" />
          : <MenuButton onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-controls="nav-drawer" />
        }
        {isOpen && (
          <nav
              id="nav-drawer"
              className={styles.drawer}
              aria-label="Navigation menu"
            >
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={item.label}>
                    {'to' in item ? (
                      <Link
                        to={item.to}
                        className={`${styles.navLink}${item.variant === 'danger' ? ` ${styles.navLinkDanger}` : item.variant === 'success' ? ` ${styles.navLinkSuccess}` : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={'disabled' in item ? item.disabled : false}
                        className={`${styles.navLink}${item.variant === 'danger' ? ` ${styles.navLinkDanger}` : item.variant === 'success' ? ` ${styles.navLinkSuccess}` : ''}`}
                        onClick={() => {
                          item.onClick()
                          setIsOpen(false)
                        }}
                      >
                        {item.label}
                        {'subtitle' in item && item.subtitle && (
                          <span className={styles.navItemSubtitle}>{item.subtitle}</span>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
        )}
      </div>
    </div>
  )
}
