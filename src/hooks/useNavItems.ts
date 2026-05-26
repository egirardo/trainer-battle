import { ROUTES } from '@/routes'
import type { NavItem } from '@/components/atoms/StickyHeader'

const BASE_NAV_LINKS: NavItem[] = [
    { label: 'Dashboard',    to: ROUTES.gameMenu },
    { label: 'View Profile', to: ROUTES.profile },
    { label: 'Lobby',        to: ROUTES.lobby },
    { label: 'Shop',         to: ROUTES.shop },
]

export function useNavItems(onHelp?: () => void, onCredits?: () => void): NavItem[] {

    const helpItem: NavItem = onHelp
        ? { label: 'Help', onClick: onHelp }
        : { label: 'Help', to: ROUTES.help }

    return [
        ...BASE_NAV_LINKS,
        helpItem,
         ...(onCredits ? [{ label: 'Credits', onClick: onCredits }] : [])
    ]
}
