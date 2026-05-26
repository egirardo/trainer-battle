import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes";
import { useResult } from "@/hooks/useResult";
import LoadingScreen from '@/components/atoms/LoadingScreen';
import StickyHeader, { type NavItem } from '@/components/atoms/StickyHeader'
import { supabase } from '@/lib/supabase'
import Button from '@/components/atoms/button'
import XpBar from '@/components/atoms/XpBar'
import LifeCreditTracker from "@/components/molecules/gameMenuPage/LifeCreditTracker";
import styles from './ResultScreen.module.css'
import { useState } from "react";
import LeaveConfirmDialog from "@/components/molecules/gameInstructions/LeaveConfirmDialog";

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
    const navigate = useNavigate()
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

    async function handleLogout(onSuccess?: () => void): Promise<void> {
        const isInIframe = window.parent !== window

        if (!isInIframe) {
            const { error } = await supabase.auth.signOut({ scope: 'local' })
            if (error) {
                console.error('Error signing out:', error)
            }
        }

        if (onSuccess) {
            onSuccess()
        } else {
            void navigate(ROUTES.start)
        }
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
    const lostALife = result.outcome === 'loss' && !result.isForfeit
    const livesLeft = result.livesRemaining
    const isGameOver = !isWin && livesLeft === 0
    const opponentLabel = result.isCpu ? 'CPU' : (result.opponentUsername ?? 'Opponent')

    return (
        <>
            <StickyHeader label="Result" navItems={navItems} />
            <main className={styles.main}>
                <LifeCreditTracker lives={result.livesRemaining ?? 0} credits={result.creditsBalance} />
                <div className={styles.outcomeSection}>
                    <h1 className={isWin ? styles.victory : styles.defeat}>
                        {isWin ? 'Victory!' : 'Defeat'}
                    </h1>
                    <p className={result.bossBeat ? styles.bossBeat : styles.opponent}>
                        {result.bossBeat ? 'You defeated the boss!' : `vs ${opponentLabel}`}
                    </p>
                    {lostALife && (
                        <p className={styles.lostLife}>
                            {isGameOver
                                ? "You've lost all your lives!"
                                : livesLeft != null
                                    ? `You lost a life! ${livesLeft} ${livesLeft === 1 ? 'life' : 'lives'} remaining.`
                                    : 'You lost a life!'}
                        </p>
                    )}
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
                    {isGameOver ? (
                        <>
                            <Button variant='danger' onClick={() => {
                                if (window.parent !== window) {
                                    setShowLeaveConfirm(true)
                                } else {
                                    void handleLogout()
                                }
                            }}>
                                {window.parent !== window ? 'Back to Loopland' : 'Sign out'}
                            </Button>
                            {showLeaveConfirm && (
                                <LeaveConfirmDialog
                                    onConfirm={() => void handleLogout(() => {
                                        setShowLeaveConfirm(false)
                                        window.parent.postMessage({ type: 'AMUSEMENT_CLOSE' }, 'https://loopland.se')
                                    })}
                                    onCancel={() => setShowLeaveConfirm(false)}
                                />
                            )}
                        </>
                    ) : isWin ? (
                        <>
                            <Button className={styles.asLink} as={Link} to={ROUTES.lobby}>
                                Play Again
                            </Button>
                            <Button className={styles.asLink} as={Link} to={ROUTES.gameMenu}>
                                Main Menu
                            </Button>
                            {window.parent !== window && (
                                <>
                                    <Button onClick={() => setShowLeaveConfirm(true)}>
                                        Back to Loopland
                                    </Button>
                                    {showLeaveConfirm && (
                                        <LeaveConfirmDialog
                                            onConfirm={() => void handleLogout(() => {
                                                setShowLeaveConfirm(false)
                                                window.parent.postMessage({ type: 'AMUSEMENT_CLOSE' }, 'https://loopland.se')
                                            })}
                                            onCancel={() => setShowLeaveConfirm(false)}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Button variant='danger' className={styles.asLink} as={Link} to={ROUTES.lobby}>
                                Play Again
                            </Button>
                            <Button className={styles.asLink} as={Link} to={ROUTES.gameMenu}>
                                Main Menu
                            </Button>
                            {window.parent !== window && (
                                <>
                                    <Button onClick={() => setShowLeaveConfirm(true)}>
                                        Back to Loopland
                                    </Button>
                                    {showLeaveConfirm && (
                                        <LeaveConfirmDialog
                                            onConfirm={() => {
                                                setShowLeaveConfirm(false)
                                                window.parent.postMessage({ type: 'AMUSEMENT_CLOSE' }, 'https://loopland.se')
                                            }}
                                            onCancel={() => setShowLeaveConfirm(false)}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    )
}
