import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import MenuButton from './headerButtons/MenuButton'
import CloseButton from './headerButtons/CloseButton'
import styles from './StickyHeader.module.css'
import type { ReactNode } from 'react'

type LinkNavItem   = { label: string; to: string;          variant?: 'danger' | 'success'; disabled?: boolean }
type ActionNavItem = { label: string; onClick: () => void; variant?: 'danger' | 'success'; disabled?: boolean; subtitle?: string }
export type NavItem = LinkNavItem | ActionNavItem

interface Props {
    label: string;
    action?: ReactNode;
    navItems?: NavItem[];
}

export default function StickyHeader({ label, action, navItems }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const hasNav = !!navItems?.length

    useEffect(() => {
        if (!isOpen || !hasNav) return

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
    }, [isOpen, hasNav])

    const containerClass = navItems?.length
        ? `${styles.stickyContainer} ${styles.navMode}`
        : styles.stickyContainer

    return (
        <div className={containerClass} ref={wrapperRef}>
            <div className={styles.headerRow}>
                <h1 className={styles.stickyHeading}>{label}</h1>
                {navItems?.length ? (
                    isOpen
                        ? <CloseButton onClick={() => setIsOpen(false)} aria-expanded={isOpen} aria-controls="nav-drawer" />
                        : <MenuButton onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-controls="nav-drawer" />
                ) : action}
                {navItems?.length && isOpen && (
                    <nav id="nav-drawer" className={styles.drawer} aria-label="Navigation menu">
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
                                            disabled={item.disabled}
                                            className={`${styles.navLink}${item.variant === 'danger' ? ` ${styles.navLinkDanger}` : item.variant === 'success' ? ` ${styles.navLinkSuccess}` : ''}`}
                                            onClick={() => { item.onClick(); setIsOpen(false) }}
                                        >
                                            {item.label}
                                            {item.subtitle && <span className={styles.navItemSubtitle}>{item.subtitle}</span>}
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
