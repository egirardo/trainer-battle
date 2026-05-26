import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import { useAuth } from "./useAuth";
import type { PlayerStats } from "@/models/models";

type StatsState = {
    stats: PlayerStats | null;
    loading: boolean;
    error: string | null;
};

export function usePlayerStats() {
    const { user } = useAuth();
    const [state, setState] = useState<StatsState>({ stats: null, loading: true, error: null });

    useEffect(() => {
        async function syncStats() {
            if (!user) {
                setState({ stats: null, loading: false, error: null });
                return;
            }

            setState(prev => ({ ...prev, loading: true }));
            const { data, error } = await fetchFromSupabase(() =>
                supabase
                    .from("player_stats")
                    .select("*")
                    .eq("player_id", user.id)
                    .maybeSingle()
            );

            if (error) {
                setState({ stats: null, loading: false, error: error.message });
            } else {
                setState({ stats: data, loading: false, error: null });
            }
        }

        void syncStats();
    }, [user]);

    return state;
}
