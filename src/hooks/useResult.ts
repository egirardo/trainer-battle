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

        async function loadResult() {
            try {
                // Fetch session
                const { data: session, error: sessionErr } = await supabase
                    .from('game_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .single();

                if (sessionErr || !session) throw new Error('Session not found');

                // Determine outcome
                const outcome: ResultOutcome = session.winner_id === user.id ? 'win' : 'loss'

                // Fetch opponent username for PVP
                let opponentUsername: string | null = null;
                if (!session.is_cpu) {
                    const opponentId = session.player1_id === user.id
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

                // Fetch player stats
                const { data: stats } = await supabase
                    .from('player_stats')
                    .select('total_wins, total_losses, total_battles, credits')
                    .eq('player_id', user.id)
                    .single();

                setResult({
                    outcome,
                    isCpu: session.is_cpu,
                    opponentUsername,
                    totalWins: stats?.total_wins ?? 0,
                    totalLosses: stats?.total_losses ?? 0,
                    totalBattles: stats?.total_battles ?? 0,
                    credits: stats?.credits ?? 0,
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