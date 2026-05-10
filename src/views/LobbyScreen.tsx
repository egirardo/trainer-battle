import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "@/hooks/useLobby";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ROUTES } from "@/routes";

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
            sessionChannelRef.current?.unsubscribe();
        };
    }, []);

    async function handleInvite(opponentId: string): Promise<void> {
        if (!myCreatureId || inviteSent) return;

        // Unsubscribe from any existing session channel before subscribing to the new one
        sessionChannelRef.current?.unsubscribe();
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
            <h1>Lobby</h1>

            {incomingInvitation && (
                <section aria-label="Incoming battle invitation">
                    <h2>Battle Invitation!</h2>
                    <p>{incomingInvitation.fromUsername} wants to battle you!</p>
                    <button onClick={handleAccept}>Accept</button>
                    <button onClick={handleDecline}>Decline</button>
                </section>
            )}

            <section aria-label="Players in Lobby">
                <h2>Players in Lobby</h2>
                {playersInLobby.length === 0 ? (
                    <p>No other players in the lobby. Wait for someone to join!</p>
                ) : (
                    <ul>
                        {playersInLobby.map((player) => (
                            <li key={player.userId}>
                                <span>{player.username}</span>
                                <span>{player.creatureName}</span>
                                <span>Lv. {player.level}</span>
                                <button
                                    onClick={() => handleInvite(player.userId)}
                                    disabled={!!incomingInvitation || inviteSent}
                                >
                                    {inviteSent ? "Waiting..." : "Invite"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label="CPU battle">
                <h2>Battle against CPU</h2>
                <p>Your opponent will match your skill level.</p>
                <button onClick={handleCpu}>Fight CPU</button>
            </section>

            <button onClick={() => navigate(ROUTES.gameMenu)}>
                Back to Menu
            </button>
        </main>
    );
}