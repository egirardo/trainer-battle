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
    const { acceptInvitation, declineInvitation, createPvpSession, createCpuSession, error: sessionError } = useGameSession();

    const [playersInLobby, setPlayersInLobby] = useState<LobbyPlayer[]>([]);
    const [incomingInvitation, setIncomingInvitation] = useState<IncomingInvitation | null>(null);
    const [myCreatureId, setMyCreatureId] = useState<number | null>(null);
    const [pendingPlayerIds, setPendingPlayerIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const pendingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const hasInviteRef = useRef(false);
    const inviteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                            if (hasInviteRef.current) {
                                // Decline extra invites
                                void supabase
                                    .from('game_sessions')
                                    .update({ status: 'declined' })
                                    .eq('id', session.id)
                                return;
                            }

                            hasInviteRef.current = true;

                            const { data: inviterProfile } = await supabase
                                .from('profiles')
                                .select('username')
                                .eq('id', session.player1_id)
                                .single();

                            setIncomingInvitation({
                                sessionId: session.id,
                                fromUserId: session.player1_id,
                                fromUsername: inviterProfile?.username ?? "Unknown",
                                creatureId: session.player1_creature_id ?? 0,
                            })

                            // Start timeout
                            inviteTimeoutRef.current = setTimeout(() => {
                                if (!hasInviteRef.current) return
                                void supabase
                                    .from('game_sessions')
                                    .update({ status: 'declined' })
                                    .eq('id', session.id)
                                    .eq('status', 'pending')  // ← guard against racing accept
                                hasInviteRef.current = false
                                setIncomingInvitation(null)
                            }, 30000)
                            
                        } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to process invitation')
                        }
                    })()
                }
            )
            .subscribe();

        return channel;
    }, [user?.id]);

    const sessionAcceptedChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const subscribeToSessionAccepted = useCallback((sessionId: number, onDeclined: () => void): ReturnType<typeof supabase.channel> => {
        // Clean up any existing channel
        if (sessionAcceptedChannelRef.current) {
            void supabase.removeChannel(sessionAcceptedChannelRef.current);
        }

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

        sessionAcceptedChannelRef.current = channel;
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

            await supabase
                .from('game_sessions')
                .update({ status: 'declined' })
                .eq('player1_id', user!.id)
                .eq('status', 'pending')

            const { data: pendingSessions } = await supabase
                .from('game_sessions')
                .select('player2_id')
                .eq('status', 'pending')

            setPendingPlayerIds(new Set((pendingSessions ?? []).map(s => s.player2_id as string)))

            if (pendingChannelRef.current) {
                void supabase.removeChannel(pendingChannelRef.current)
            }
            pendingChannelRef.current = supabase
                .channel('pending_invites')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sessions' }, (payload) => {
                    const session = payload.new as { player2_id: string; status: string }
                    if (session.status === 'pending') {
                        setPendingPlayerIds(prev => new Set([...prev, session.player2_id]))
                    }
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sessions' }, (payload) => {
                    const session = payload.new as { player2_id: string; status: string }
                    if (session.status !== 'pending') {
                        setPendingPlayerIds(prev => { const next = new Set(prev); next.delete(session.player2_id); return next })
                    }
                })
                .subscribe()

            const { data: existingInvite } = await supabase
                .from('game_sessions')
                .select('id, player1_id, player1_creature_id')
                .eq('player2_id', user!.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle()

            if (existingInvite) {
                const { data: inviterProfile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', existingInvite.player1_id)
                    .single();

                hasInviteRef.current = true;
                setIncomingInvitation({
                    sessionId: existingInvite.id,
                    fromUserId: existingInvite.player1_id,
                    fromUsername: inviterProfile?.username ?? 'Unknown',
                    creatureId: existingInvite.player1_creature_id ?? 0,
                })

                // Start timeout
                inviteTimeoutRef.current = setTimeout(() => {
                    void supabase
                        .from('game_sessions')
                        .update({ status: 'declined' })
                        .eq('id', existingInvite.id)
                        .eq('status', 'pending')
                    hasInviteRef.current = false
                    setIncomingInvitation(null)
                }, 30000)
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
                    .filter((p) => {
                         if (p.userId === user!.id || seen.has(p.userId)) {
                             return false;
                         }
                         seen.add(p.userId);
                         return true;
                     });
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
            if (pendingChannelRef.current) {
                void supabase.removeChannel(pendingChannelRef.current)
                pendingChannelRef.current = null
            }
            if (sessionAcceptedChannelRef.current) {
                void supabase.removeChannel(sessionAcceptedChannelRef.current)
                sessionAcceptedChannelRef.current = null
            }
            if (inviteTimeoutRef.current) {
                clearTimeout(inviteTimeoutRef.current);
                inviteTimeoutRef.current = null;
            }
            void invitationChannel?.unsubscribe();
        };
    }, [user?.id, profile?.username, fetchMyCreature, subscribeToInvitations]);

    async function handleAccept(): Promise<void> {
        if (!incomingInvitation || !myCreatureId) return;
        if (inviteTimeoutRef.current) {
            clearTimeout(inviteTimeoutRef.current);
            inviteTimeoutRef.current = null;
        }
        await acceptInvitation(incomingInvitation.sessionId, myCreatureId);
        setIncomingInvitation(null);
        hasInviteRef.current = false;
    }

    async function handleDecline(): Promise<void> {
        if (!incomingInvitation) return;
        if (inviteTimeoutRef.current) {
            clearTimeout(inviteTimeoutRef.current);
            inviteTimeoutRef.current = null;
        }
        await declineInvitation(incomingInvitation.sessionId);
        setIncomingInvitation(null);
        hasInviteRef.current = false;
    }

    return {
        playersInLobby,
        incomingInvitation,
        myCreatureId,
        pendingPlayerIds,
        loading,
        error: sessionError ?? error,
        handleAccept,
        handleDecline,
        createPvpSession,
        createCpuSession,
        subscribeToSessionAccepted,
    };
}