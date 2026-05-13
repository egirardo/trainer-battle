import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { GameSession } from "@/models/models";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import { ROUTES } from "@/routes";


export function useGameSession() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [session, setSession] = useState<GameSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create a PVP session
    async function createPvpSession(
        opponentId: string,
        myCreatureId: number,
    ): Promise<number | null> {
        if (!user) return null;

        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase(() =>
            supabase
                .from("game_sessions")
                .insert({
                    player1_id: user.id,
                    player2_id: opponentId,
                    player1_creature_id: myCreatureId,
                    is_cpu: false,
                    status: "pending",
                    current_turn: user.id,
                })
                .select()
                .single()
        );

        if (error || !data) {
            setError(error?.message ?? "Unknown error");
            setLoading(false);
            return null;
        }

        setSession(data as GameSession);
        setLoading(false);
        return data.id;
    }

    // Create a CPU session
    async function createCpuSession(myCreatureId: number): Promise<void> {
        if (!user) return;
        setError(null);
        setLoading(true);

        const { data, error } = await fetchFromSupabase(() =>
            supabase
                .from("game_sessions")
                .insert({
                    player1_id: user.id,
                    player1_creature_id: myCreatureId,
                    is_cpu: true,
                    status: "active",
                    current_turn: user.id,
                })
                .select()
                .single()
        );

        if (error || !data) {
            setError(error?.message ?? "Unknown error");
            setLoading(false);
            return;
        }

        setSession(data as GameSession);
        await navigate(`${ROUTES.battle}/${data.id}`);
        setLoading(false);
    }

    // Accept a PVP session
    async function acceptInvitation (
        sessionId: number,
        myCreatureId: number
    ): Promise<void> {
        if (!user) return;
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase(() =>
            supabase
                .from("game_sessions")
                .update({
                    player2_creature_id: myCreatureId,
                    status: "active",
                })
                .eq("id", sessionId)
                .select()
                .single()
        );

        if (error || !data) {
            setError(error?.message ?? "Unknown error");
            setLoading(false);
            return;
        }

        setSession(data as GameSession);
        await navigate(`${ROUTES.battle}/${data.id}`);
        setLoading(false);
    }

    // Decline a PVP session
    async function declineInvitation(sessionId: number): Promise<void> {
        if (!user) return;
        setLoading(true);
        setError(null);

        const { error } = await supabase
            .from("game_sessions")
            .update({ status: "declined" })
            .eq("id", sessionId);

        if (error) {
            console.error("Error declining session:", error.message);
            setError(error.message);
            setLoading(false);
            return;
        }

        setSession(null);
        setLoading(false);
    }

    // Fetch an existing session by ID
    async function fetchSession(sessionId: number): Promise<void> {
        setError(null);
        setLoading(true);

        const { data, error } = await fetchFromSupabase(() =>
            supabase
                .from("game_sessions")
                .select()
                .eq("id", sessionId)
                .single()
        );

        if (error || !data) {
            setError(error?.message ?? "Unknown error");
            setLoading(false);
            return;
        }

        setSession(data as GameSession);
        setLoading(false);
    }

    return {
        session,
        loading,
        error,
        createPvpSession,
        createCpuSession,
        acceptInvitation,
        declineInvitation,
        fetchSession,
    };
}