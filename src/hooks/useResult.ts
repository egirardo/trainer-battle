import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";
import type { ResultOutcome, ResultData } from "@/models/models";

export function useResult(sessionId: number) {
    const { user } = useAuth();
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!user) {
            setLoading(false);
            return;
        }

        const currentUser = user;

        async function loadResult() {
            try {
                // Fetch session
                const { data: session, error: sessionErr } = await supabase
                    .from('game_sessions')
                    .select('*, forfeit_by')
                    .eq('id', sessionId)
                    .single();

                if (sessionErr || !session) throw new Error('Session not found');

                // Determine outcome
                const outcome: ResultOutcome = session.winner_id === currentUser.id ? 'win' : 'loss'

                // Fetch opponent username for PVP
                let opponentUsername: string | null = null;
                if (!session.is_cpu) {
                    const opponentId = session.player1_id === currentUser.id
                        ? session.player2_id
                        : session.player1_id;

                    if (opponentId) {
                        const { data: opponentProfile } = await supabase
                            .from('profiles')
                            .select('username')
                            .eq('id', opponentId)
                            .single()
                        opponentUsername = opponentProfile?.username ?? null;
                    }
                }

                // Fetch player stats, creature data, and xp config in parallel
                const [statsResult, creatureResult, configResult] = await Promise.all([
                    supabase
                        .from('player_stats')
                        .select('total_wins, total_losses, total_forfeits')
                        .eq('player_id', currentUser.id)
                        .single(),
                    supabase
                        .from('player_creatures')
                        .select('level, experience')
                        .eq('player_id', currentUser.id)
                        .single(),
                    supabase
                        .from('game_config')
                        .select('xp_per_level, xp_cpu_win, xp_pvp_win, xp_cpu_loss, xp_pvp_loss, credits_cpu_win, credits_cpu_loss, credits_pvp_win, credits_pvp_loss, credits_forfeit')
                        .maybeSingle(),
                ]);

                const cached = sessionStorage.getItem(`battle-result-${sessionId}`);
                sessionStorage.removeItem(`battle-result-${sessionId}`);
                const serverResult = cached ? JSON.parse(cached) as { xpGained: number; creditsGained: number; newLevel: number; leveledUp: boolean } : null;

                const xpGained = serverResult?.xpGained ?? (outcome === 'win'
                    ? (session.is_cpu ? (configResult.data?.xp_cpu_win ?? 50) : (configResult.data?.xp_pvp_win ?? 100))
                    : (session.is_cpu ? (configResult.data?.xp_cpu_loss ?? 25) : (configResult.data?.xp_pvp_loss ?? 50)));

                const isForfeit = session.forfeit_by === currentUser.id;
                const creditsGained = serverResult?.creditsGained ?? (isForfeit
                    ? -(configResult.data?.credits_forfeit ?? 50)
                    : outcome === 'win'
                        ? (session.is_cpu ? (configResult.data?.credits_cpu_win ?? 50) : (configResult.data?.credits_pvp_win ?? 100))
                        : (session.is_cpu ? -(configResult.data?.credits_cpu_loss ?? 10) : -(configResult.data?.credits_pvp_loss ?? 25)));

                const newLevel = serverResult?.newLevel ?? creatureResult.data?.level ?? 1;
                const currentExp = creatureResult.data?.experience ?? 0;
                const xpPerLevel = configResult.data?.xp_per_level ?? 100;
                const prevLevel = Math.floor((currentExp - xpGained) / xpPerLevel) + 1;
                const leveledUp = serverResult?.leveledUp ?? newLevel > prevLevel;

                setResult({
                    outcome,
                    isCpu: session.is_cpu,
                    isForfeit,
                    opponentUsername,
                    totalWins: statsResult.data?.total_wins ?? 0,
                    totalLosses: statsResult.data?.total_losses ?? 0,
                    totalForfeits: statsResult.data?.total_forfeits ?? 0,
                    xpGained,
                    creditsGained,
                    newLevel,
                    currentXp: currentExp % xpPerLevel,
                    xpPerLevel,
                    leveledUp,
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        void loadResult()
    }, [sessionId, user]);

    return { result, loading, error }
}