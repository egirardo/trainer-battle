import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { useGameSession } from "./useGameSession";
import { LobbyPlayer, IncomingInvitation } from "@/models/models";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import { getCreatureImage } from "@/lib/creatureImages";
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
import { ROUTES } from "@/routes";

export function useLobby() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { acceptInvitation, declineInvitation, createPvpSession, createCpuSession } = useGameSession();

    const [playersInLobby, setPlayersInLobby] = useState<LobbyPlayer[]>([]);
    const [incomingInvitation, setIncomingInvitation] = useState<IncomingInvitation | null>(null);
    const [myCreatureId, setMyCreatureId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    // Fetch players active creature
    const fetchMyCreature = useCallback(async (): Promise<number | null> => {
        if (!user) return null;

        const { data, error } = await fetchFromSupabase(() =>
            supabase
                .from("player_creatures")
                .select("id, level")
                .eq("player_id", user.id)
                .single()
        );

        if (error || !data) {
            setError(error?.message ?? "Unknown error");
            return null;
        }

        setMyCreatureId(data.id);
        return data.id;
    }, [user?.id]);



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
                (payload) => {
                    void (async () => {
                        try {
                            const session = payload.new as {
                                id: number;
                                player1_id: string;
                                player1_creature_id: number;
                                status: string;
                            };

                            if (session.status !== "pending") return;

                            const { data: inviterProfile } = await supabase
                                .from("profiles")
                                .select("username")
                                .eq("id", session.player1_id)
                                .single();

                            setIncomingInvitation({
                                sessionId: session.id,
                                fromUserId: session.player1_id,
                                fromUsername: inviterProfile?.username ?? "Unknown",
                                creatureId: session.player1_creature_id ?? 0,
                            });
                        } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to process invitation')
                        }
                    })()
                }
            )
            .subscribe();

        return channel;
    }, [user?.id]);

    const subscribeToSessionAccepted = useCallback((sessionId: number, onDeclined: () => void): ReturnType<typeof supabase.channel> => {
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
                        void navigate(`${ROUTES.battle}/${updated.id}`);
                    } else if (updated.status === "declined") {
                        onDeclined();
                    }
                }
            )
            .subscribe();

        return channel;
    }, [navigate]);

    useEffect(() => {
        if (!user || !profile) return;

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
                .select("level, creatures(name, type, image)")
                .eq("id", creatureId)
                .single();

            if (presenceChannelRef.current) {
                await supabase.removeChannel(presenceChannelRef.current)
                presenceChannelRef.current = null
            }

            const rawCreature = creature?.creatures;
            const creatureData = (Array.isArray(rawCreature) ? rawCreature[0] : rawCreature) as { name: string | null; type: string | null; image: string | null } | null;

            presenceChannelRef.current = supabase.channel('lobby', {
                config: { presence: { key: user!.id } }
            })

            presenceChannelRef.current
                .on("presence", { event: "sync" }, () => {
                const state = presenceChannelRef.current!.presenceState<LobbyPlayer>();
                const seen = new Set<string>();
                const players = Object.values(state)
                    .flat()
                    .map((p) => p as unknown as LobbyPlayer)
                    .filter((p) => p.userId !== user!.id && !seen.has(p.userId) && !!seen.add(p.userId));
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
                .subscribe((status) => {
                    if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
                        void presenceChannelRef.current!.track({
                            userId: user!.id,
                            username: profile!.username ?? "Unknown",
                            creatureId: creatureId,
                            creatureName: creatureData?.name ?? "Unknown",
                            creatureType: creatureData?.type ?? "fire",
                            creatureImage: getCreatureImage(creatureData?.image ?? ""),
                            level: creature?.level ?? 1,
                        }).then(() => setLoading(false));
                    }
                });
                
        }
        void joinLobby();

        const invitationChannel = subscribeToInvitations();

        return () => {
            if (presenceChannelRef.current) {
                void supabase.removeChannel(presenceChannelRef.current)
                presenceChannelRef.current = null
            }
            void invitationChannel?.unsubscribe();
        };
    }, [user?.id, profile?.username, fetchMyCreature, subscribeToInvitations]);

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