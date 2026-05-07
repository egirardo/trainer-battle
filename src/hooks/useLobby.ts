import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useGameSession } from "./useGameSession";
import { LobbyPlayer, IncomingInvitation, ApiError } from "@/models/models";

export function useLobby() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { acceptInvitation, declineInvitation, createPvpSession, createCpuSession } = useGameSession();

    const [playersInLobby, setPlayersInLobby] = useState<LobbyPlayer[]>([]);
    const [incomingInvitation, setIncomingInvitation] = useState<IncomingInvitation | null>(null);
    const [myCreatureId, setMyCreatureId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch players active creature
    async function fetchMyCreature(): Promise<number | null> {
        if (!user) return null;

        const { data, error: fetchError } = await supabase
            .from("player_creatures")
            .select("id, level")
            .eq("player_id", user.id)
            .limit(1);

        if (fetchError || !data || data.length === 0) {
            if (fetchError) {
                const apiError: ApiError = { message: fetchError.message };
                console.error("Error fetching active creature:", apiError);
                setError(fetchError.message);
            }
            return null;
        }

        setMyCreatureId(data[0].id);
        return data[0].id;
    }



    // Listen for incoming PVP invitations targeting this user
    const subscribeToInvitations = useCallback(() => {
        if (!user) return;

        const channel = supabase
            .channel(`invitations:${user.id}`)
            .on(
                "postgres_changes", 
                {
                    event: "INSERT",
                    schema: "public",
                    table: "game_sessions",
                    filter: `player2_id=eq.${user.id}`,
                },
                async (payload) => {
                    const session = payload.new as {
                        id: number;
                        player1_id: string;
                        status: string;
                    };

                    if (session.status !== "pending") return;

                    // Fetch the inviter's profile
                    const { data: inviterProfile } = await supabase
                        .from("profiles")
                        .select("username")
                        .eq("id", session.player1_id)
                        .single();

                    // Fetch the inviter's active creature
                    const { data: inviterCreature } = await supabase
                        .from("player_creatures")
                        .select("id")
                        .eq("player_id", session.player1_id)
                        .single();

                    setIncomingInvitation({
                        sessionId: session.id,
                        fromUserId: session.player1_id,
                        fromUsername: inviterProfile?.username ?? "Unknown",
                        creatureId: inviterCreature?.id ?? 0,
                    });
                }
            )
            .subscribe();

        return channel;
    }, [user]);

    function subscribeToSessionAccepted(sessionId: number): ReturnType<typeof supabase.channel> {
        const channel = supabase
            .channel(`session_accepted:${sessionId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "game_sessions",
                    filter: `id=eq.${sessionId}`,
                },
                (payload) => {
                    const updated = payload.new as { status: string; id: number };
                    if (updated.status === "active") {
                        navigate(`/battle/${updated.id}`);
                    }
                }
            )
            .subscribe();

        return channel;
    }

    useEffect(() => {
        if (!user || !profile) return;

        let presenceChannel: ReturnType<typeof supabase.channel>;

        async function joinLobby() {
            setLoading(true);
            
            const creatureId = await fetchMyCreature();
            if (!creatureId) {
                setError("No creature found. Please select a creature first.");
                setLoading(false);
                return;
            }

            // Fetch creature details for presence
            const { data: creature } = await supabase
                .from("player_creatures")
                .select("level, creatures(name)")
                .eq("id", creatureId)
                .single();

            // Set up presence channel
            presenceChannel = supabase.channel("lobby", {
                config: { presence: { key: user!.id } }
            });

            presenceChannel
                .on("presence", { event: "sync" }, () => {
                const state = presenceChannel.presenceState<LobbyPlayer>();
                const players = Object.values(state)
                    .flat()
                    .map((p) => p as unknown as LobbyPlayer)
                    .filter((p) => p.userId !== user!.id);
                setPlayersInLobby(players);
                })
                .on("presence", { event: "join" }, ({ newPresences }) => {
                    const joined = newPresences as unknown as LobbyPlayer[];
                    setPlayersInLobby((prev) => [
                        ...prev.filter((p) => !joined.find((n) => n.userId === p.userId)),
                        ...joined.filter((p) => p.userId !== user!.id)
                    ]);
                })
                .on("presence", { event: "leave" }, ({ leftPresences }) => {
                    const left = leftPresences as unknown as LobbyPlayer[];
                    setPlayersInLobby((prev) =>
                        prev.filter((p) => !left.find((l) => l.userId === p.userId))
                    );
                })
                .subscribe(async (status) => {
                    if (status === "SUBSCRIBED") {
                        await presenceChannel.track({
                            userId: user!.id,
                            username: profile!.username ?? "Unknown",
                            creatureId: creatureId,
                            creatureName: creature?.creatures?.name ?? "Unknown",
                            level: creature?.level ?? 1,
                        });
                        setLoading(false);
                    }
                });
                
        }
        joinLobby();

        const invitationChannel = subscribeToInvitations();

        return () => {
            presenceChannel?.unsubscribe();
            invitationChannel?.unsubscribe();
        };
    }, [user, profile]);

    async function handleAccept(): Promise<void> {
        if (!incomingInvitation || !myCreatureId) return;
        await acceptInvitation(incomingInvitation.sessionId, myCreatureId);
        setIncomingInvitation(null);
    }

    async function handleDecline(): Promise<void> {
        if (!incomingInvitation) return;
        await declineInvitation(incomingInvitation.sessionId);
        setIncomingInvitation(null);
    }

    return {
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
    };
}