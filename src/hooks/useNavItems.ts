import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/routes'
import type { NavItem } from '@/components/atoms/StickyHeader'
import { useAuth } from './useAuth'

const BASE_NAV_LINKS: NavItem[] = [
    { label: 'Dashboard',    to: ROUTES.gameMenu },
    { label: 'View Profile', to: ROUTES.profile },
    { label: 'Lobby',        to: ROUTES.lobby },
    { label: 'Shop',         to: ROUTES.shop },
    { label: 'Help',         to: ROUTES.help },
]

export function useNavItems(): NavItem[] {
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const isCentralbankUser = !!profile?.centralbank_uuid

    const [credits, setCredits] = useState(0)
    const [transactionId, setTransactionId] = useState<string | null>(null)
    const [startingCredits, setStartingCredits] = useState(50)

    useEffect(() => {
        async function syncStats() {
            if (!user || !isCentralbankUser) {
                setCredits(0)
                setTransactionId(null)
                setStartingCredits(50)
                return
            }
            const { data, error } = await supabase
                .from('player_stats')
                .select('credits, transaction_id, starting_credits')
                .eq('player_id', user.id)
                .maybeSingle()
            if (error || !data) {
                if (error) console.error('Failed to fetch player stats:', error)
                setCredits(0)
                setTransactionId(null)
                setStartingCredits(50)
                return
            }
            setCredits(data.credits)
            setTransactionId(data.transaction_id)
            setStartingCredits(data.starting_credits)
        }
        void syncStats()
    }, [user, isCentralbankUser])

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Failed to sign out:', error)
            return
        }
        void navigate(ROUTES.start)
    }

    async function handleCashOut(): Promise<void> {
        const result = await supabase.functions.invoke<void>('cashout')
        if (result.error) {
            console.error('Cash out failed:', result.error)
            return
        }
        await supabase.auth.signOut()
        void navigate(ROUTES.start)
    }

    const canCashOut = isCentralbankUser && !!transactionId && credits > startingCredits
    const profit = Math.max(0, credits - startingCredits)
    const payout = Math.floor(profit * 0.03 / 0.5) * 0.5

    const cashOutItem: NavItem | null = isCentralbankUser ? {
        label: 'Cash Out',
        onClick: () => void handleCashOut(),
        variant: 'success' as const,
        disabled: !canCashOut,
        subtitle: !canCashOut ? 'Win more credits to cash out' : `€${payout}`,
    } : null

    return [
        ...BASE_NAV_LINKS,
        ...(cashOutItem ? [cashOutItem] : []),
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]
}
