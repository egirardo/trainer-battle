import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../routes';
import NavigableHeader, { type NavItem } from '@/components/molecules/NavigableHeader';
import GameMenuBody from '@/components/molecules/gameMenuPage/GameMenuBody';
import { useEffect, useState } from 'react';

export default function GameMenuScreen(){
    const { user, loading, profile } = useAuth();
    const [credits, setCredits] = useState<number>(0)
    const [transactionId, setTransactionId] = useState<string | null>(null)
    const navigate = useNavigate();
    const [startingCredits, setStartingCredits] = useState<number>(50)

    useEffect(() => {
        if (!user) return
        async function fetchStats() {
            const { data } = await supabase
                .from('player_stats')
                .select('credits, transaction_id, starting_credits')
                .eq('player_id', user!.id)
                .maybeSingle()
            if (data) {
                setCredits(data.credits)
                setTransactionId(data.transaction_id)
                setStartingCredits(data.starting_credits)
            } else {
                setCredits(0)
                setTransactionId(null)
                setStartingCredits(0)
            }
        }
        void fetchStats()
    }, [user])

    const isCentralbankUser = !!profile?.centralbank_uuid
    const canCashOut = isCentralbankUser && !!transactionId && credits > startingCredits

    async function handleCashOut(): Promise<void> {
        const { error } = await supabase.functions.invoke('cashout')

        if (error) {
            console.error('Cash out failed:', error)
            return
        }

        // Sign out after cashout
        await supabase.auth.signOut()
        void navigate(ROUTES.start)
    }

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }

        void navigate(ROUTES.start);
    }

    function calculatePayout(credits: number): number {
        const raw = credits * 0.03
        return Math.floor(raw / 0.5) * 0.5
    }

    const payout = calculatePayout(Math.max(0, credits - startingCredits))
    const navItems: NavItem[] = [
        { label: 'Dashboard', to: ROUTES.gameMenu },
        { label: 'Lobby', to: ROUTES.lobby },
        { label: 'Shop', to: ROUTES.shop },
        { label: 'Help', to: ROUTES.help },
        { label: 'Credits', to: ROUTES.credits },
        { label: 'View Profile', to: ROUTES.profile },
        ...(isCentralbankUser ? [{ 
            label: 'Cash Out', 
            onClick: () => void handleCashOut(), 
            variant: 'success' as const, 
            disabled: !canCashOut,
            subtitle: !canCashOut ? 'Win more credits to cash out' : `€${payout}`
        }] : []),
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]

    if (loading) {
        return <p>Loading...</p>;
    }

    return(
        <>
            <header>
                <NavigableHeader label="Dashboard" navItems={navItems} />
            </header>
            <main>
                <GameMenuBody />
            </main>
        </>
    )
}
