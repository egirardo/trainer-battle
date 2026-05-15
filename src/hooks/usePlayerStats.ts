import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import { useAuth } from "./useAuth";
import type { PlayerStats } from "@/models/models";

export function usePlayerStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        async function fetchStats() {
            setLoading(true);
            const { data, error } = await fetchFromSupabase(() =>
                supabase
                    .from("player_stats")
                    .select("*")
                    .eq("player_id", user!.id)
                    .single()
            );

            if (error) {
                setError(error.message);
            } else if (data) {
                setStats(data);
            }
            setLoading(false);
        }

        void fetchStats();
    }, [user]);

    return { stats, loading, error };
}
