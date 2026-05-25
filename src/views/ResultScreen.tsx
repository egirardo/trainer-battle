import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";
import { useResult } from "@/hooks/useResult";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import LoadingScreen from '@/components/atoms/LoadingScreen';
import StickyHeader, { type NavItem } from '@/components/atoms/StickyHeader'
import { supabase } from '@/lib/supabase'
import Button from '@/components/atoms/button'
import XpBar from '@/components/atoms/XpBar'
import LifeCreditTracker from "@/components/molecules/gameMenuPage/LifeCreditTracker";
import styles from './ResultScreen.module.css'

export default function ResultScreen() {
    const { sessionId } = useParams<{ sessionId: string }>()
    const id = Number(sessionId)

    if (!sessionId || isNaN(id)) {
        return <Navigate to={ROUTES.lobby} replace />
    }

    return <ResultContent sessionId={id} />
}

function ResultContent({ sessionId }: { sessionId: number }) {
    const { result, loading, error } = useResult(sessionId)
    const { stats } = usePlayerStats()
    const navigate = useNavigate()

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) { console.error('Failed to sign out:', error); return }
        void navigate(ROUTES.start)
    }

    const navItems: NavItem[] = [
        { label: 'Dashboard',    to: ROUTES.gameMenu },
        { label: 'Lobby',        to: ROUTES.lobby },
        { label: 'Shop',         to: ROUTES.shop },
        { label: 'Help',         to: ROUTES.help },
        { label: 'Credits',      to: ROUTES.credits },
        { label: 'View Profile', to: ROUTES.profile },
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]

    if (loading) return <LoadingScreen message="Loading result..." />;
    if (error || !result) return <main><p role="alert" aria-atomic="true">{error ?? 'Result data unavailable'}</p></main>;

    const isWin = result.outcome === 'win'
    const opponentLabel = result.isCpu ? 'CPU' : (result.opponentUsername ?? 'Opponent')

    return (
        <>
            <StickyHeader label="Result" navItems={navItems} />
            <main className={styles.main}>
                <LifeCreditTracker lives={stats?.lives ?? 0} credits={stats?.credits ?? 0} />
                <div className={styles.outcomeSection}>
                    <h1 className={isWin ? styles.victory : styles.defeat}>
                        {isWin ? 'Victory!' : 'Defeat'}
                    </h1>
                    <p className={styles.opponent}>vs {opponentLabel}</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Wins</span>
                        <span className={styles.statValue}>{result.totalWins}</span>
                    </div>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Losses</span>
                        <span className={styles.statValue}>{result.totalLosses}</span>
                    </div>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Forfeits</span>
                        <span className={styles.statValue}>{result.totalForfeits}</span>
                    </div>
                    <div className={styles.statRow}>
                        <span className={styles.statLabel}>Credits {result.creditsGained >= 0 ? 'earned' : 'lost'}</span>
                        <span className={styles.statValue}>{result.creditsGained >= 0 ? `+${result.creditsGained}` : result.creditsGained}</span>
                    </div>
                </div>


                <div className={styles.xpWrapper}>
                    {result.leveledUp && (
                        <h2 className={styles.levelUpBanner}>You leveled up!</h2>
                    )}
                    <XpBar
                        level={result.newLevel}
                        currentXp={result.currentXp}
                        xpPerLevel={result.xpPerLevel}
                    />
                </div>
                <div className={styles.actions}>
                    <Button 
                        variant='danger' 
                        className={styles.asLink} 
                        as={Link} 
                        to={ROUTES.lobby}>
                            Play Again
                    </Button>
                    <Button 
                        className={styles.asLink} 
                        as={Link} 
                        to={ROUTES.gameMenu}>
                            Main Menu
                    </Button>
                </div>
            </main>
        </>
    )
}
