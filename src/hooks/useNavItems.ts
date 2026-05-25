import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/routes'
import type { NavItem } from '@/components/atoms/StickyHeader'

const BASE_NAV_LINKS: NavItem[] = [
    { label: 'Dashboard',    to: ROUTES.gameMenu },
    { label: 'View Profile', to: ROUTES.profile },
    { label: 'Lobby',        to: ROUTES.lobby },
    { label: 'Shop',         to: ROUTES.shop },
]

export function useNavItems(onHelp?: () => void): NavItem[] {
    const navigate = useNavigate()

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Failed to sign out:', error)
            return
        }
        void navigate(ROUTES.start)
    }

    return [
        ...BASE_NAV_LINKS,
        ...(onHelp ? [{ label: 'Help' as const, onClick: onHelp }] : []),
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]
}
