import { ROUTES } from "@/routes";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "@/hooks/useLobby";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import NavigableHeader, { type NavItem } from "@/components/molecules/NavigableHeader";
import styles from './LobbyScreen.module.css'
import Button from "@/components/atoms/button";
import LoadingScreen from '@/components/atoms/LoadingScreen';
import ArrowBackNav from "@/components/atoms/ArrowBackNav";

export default function LobbyScreen() {
    const navigate = useNavigate();
    const sessionChannelRef = useRef<RealtimeChannel | null>(null);

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }
        void navigate(ROUTES.start);
    }

    const navItems: NavItem[] = [
        { label: 'Dashboard', to: ROUTES.gameMenu },
        { label: 'Lobby', to: ROUTES.lobby },
        { label: 'Shop', to: ROUTES.shop },
        { label: 'Help', to: ROUTES.help },
        { label: 'Credits', to: ROUTES.credits },
        { label: 'View Profile', to: ROUTES.profile },
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]
    const [inviteState, setInviteState] = useState<{ playerId: string; status: 'waiting' | 'declined' } | null>(null);

    const {
        playersInLobby,
        incomingInvitation,
        myCreatureId,
        loading,
        error,
        handleAccept,
        handleDecline,
        createPvpSession,
        createCpuSession,
        subscribeToSessionAccepted,
    } = useLobby();

    // Cleanup session channel on unmount
    useEffect(() => {
        return () => {
           void sessionChannelRef.current?.unsubscribe();
        };
    }, []);

    async function handleInvite(opponentId: string): Promise<void> {
        if (!myCreatureId || inviteState?.status === 'waiting') return;

        await sessionChannelRef.current?.unsubscribe();
        sessionChannelRef.current = null;

        setInviteState({ playerId: opponentId, status: 'waiting' });

        const sessionId = await createPvpSession(opponentId, myCreatureId);

        if (sessionId) {
            sessionChannelRef.current = subscribeToSessionAccepted(sessionId, () => {
                setInviteState(prev => {
                    if (prev?.playerId === opponentId && prev.status === 'waiting') {
                        return { playerId: opponentId, status: 'declined' };
                    }
                    return prev;
                });
                void sessionChannelRef.current?.unsubscribe();
                sessionChannelRef.current = null;
            });
        } else {
            setInviteState(null);
        }
    }

    async function handleCpu(): Promise<void> {
        if (!myCreatureId) return;
        await createCpuSession(myCreatureId);
    }

    if (loading) return <LoadingScreen message="Joining lobby..." />;
    if (error) return <p role="alert">{error}</p>;

    return (
        <>
            <header>
                <NavigableHeader label="Lobby" navItems={navItems} />
            </header>
            <main>
            {incomingInvitation && (
                <section className={styles.invSection} aria-label="Incoming battle invitation">
                    <div className={styles.invContainer}>
                        <div className={styles.invContent}>
                            <h2 className={styles.heading}>Battle Invitation!</h2>
                            <p>{incomingInvitation.fromUsername} wants to battle you!</p>
                            <div className={styles.invBtnContainer}>
                                <Button
                                    className={styles.actionBtn}
                                    variant={"danger"}
                                    onClick={() => void handleDecline()}
                                >
                                    Decline
                                </Button>
                                <Button
                                    className={styles.actionBtn}
                                    variant={"danger"}
                                    onClick={() => void handleAccept()}
                                >
                                    Accept
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className={styles.section} aria-label="CPU battle">
                <h2 className={styles.heading}>Battle against CPU</h2>
                <p>Your opponent will match your skill level.</p>
                <Button 
                    className={styles.cpuBtn}
                    variant={"danger"}
                    onClick={() => void handleCpu()}
                >
                    Fight vs CPU
                </Button>
            </section>

            <section className={styles.section} aria-label="Players in Lobby">
                <h2 className={styles.heading}>Players in Lobby</h2>
                {playersInLobby.length === 0 ? (
                   <>
                    <p>No other players in the lobby.</p>
                    <p>Wait for someone to join!</p>
                   </>
                ) : (
                    <ul className={styles.ul}>
                        {playersInLobby.map((player) => (
                            <li className={styles.list} key={player.userId}>
                                <img src={player.creatureImage} alt={player.creatureName} className={styles.creatureImg} />
                                <div className={styles.playerContent}>
                                    <div className={styles.playerData}>
                                        <span className={styles.listData}>{player.username}</span>
                                        <span className={styles.listData}>Lv. {player.level}</span>
                                    </div>
                                    <div className={styles.playerData}>
                                        <span className={styles.listData}>{player.creatureName}</span>
                                        <span className={styles.listData}>Type: {player.creatureType}</span>
                                    </div>
                                    <div className={styles.btnContainer}>
                                        <Button
                                            className={styles.invBtn}
                                            onClick={() => void handleInvite(player.userId)}
                                            disabled={
                                                !!incomingInvitation ||
                                                inviteState?.status === 'waiting' ||
                                                (inviteState?.playerId === player.userId && inviteState?.status === 'declined')
                                            }
                                        >
                                            {(() => {
                                                const invite = inviteState;
                                                if (invite?.playerId === player.userId) {
                                                    return invite.status === 'waiting' ? "Waiting..." : "Declined";
                                                }
                                                return "Invite";
                                            })()}
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>


            <ArrowBackNav/>
            </main>
        </>
    );
}