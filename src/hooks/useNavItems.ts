import { ROUTES } from '@/routes'
import type { NavItem } from '@/components/atoms/StickyHeader'

const BASE_NAV_LINKS: NavItem[] = [
    { label: 'Dashboard',    to: ROUTES.gameMenu },
    { label: 'View Profile', to: ROUTES.profile },
    { label: 'Lobby',        to: ROUTES.lobby },
    { label: 'Shop',         to: ROUTES.shop },
    { label: 'Help',         to: ROUTES.help },
]

export function useNavItems(): NavItem[] {
    return [...BASE_NAV_LINKS]
}
