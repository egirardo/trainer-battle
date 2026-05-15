import { ROUTES } from "@/routes";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "@/hooks/useLobby";
import type { RealtimeChannel } from "@supabase/supabase-js";
import StickyHeader from "@/components/atoms/StickyHeader";
import MenuButton from "@/components/atoms/headerButtons/MenuButton";
import styles from './LobbyScreen.module.css'
import Button from "@/components/atoms/button";

export default function LobbyScreen() {
    const navigate = useNavigate();
    const sessionChannelRef = useRef<RealtimeChannel | null>(null);
    const [inviteSent, setInviteSent] = useState<boolean>(false);

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
        if (!myCreatureId || inviteSent) return;

        // Unsubscribe from any existing session channel before subscribing to the new one
        await sessionChannelRef.current?.unsubscribe();
        sessionChannelRef.current = null;

        setInviteSent(true);

        const sessionId = await createPvpSession(opponentId, myCreatureId);

        if (sessionId) {
            sessionChannelRef.current = subscribeToSessionAccepted(sessionId);
        } else {
            setInviteSent(false);
        }
    }

    async function handleCpu(): Promise<void> {
        if (!myCreatureId) return;
        await createCpuSession(myCreatureId);
    }

    if (loading) return <p>Joining lobby...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
        <main>
            <StickyHeader
                label="lobby"
                action={<MenuButton/>}
            />

            {incomingInvitation && (
                <section aria-label="Incoming battle invitation">
                    <h2 className={styles.heading}>Battle Invitation!</h2>
                    <p>{incomingInvitation.fromUsername} wants to battle you!</p>
                    <button onClick={() => void handleAccept()}>Accept</button>
                    <button onClick={() => void handleDecline()}>Decline</button>
                </section>
            )}

            <section aria-label="Players in Lobby">
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
                                            disabled={!!incomingInvitation || inviteSent}
                                        >
                                            {inviteSent ? "Waiting..." : "Invite"}
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label="CPU battle">
                <h2 className={styles.heading}>Battle against CPU</h2>
                <p>Your opponent will match your skill level.</p>
                <button onClick={() => void handleCpu()}>Fight CPU</button>
            </section>

            <button onClick={() => void navigate(ROUTES.gameMenu)}>
                Back to Menu
            </button>
        </main>
    );
}