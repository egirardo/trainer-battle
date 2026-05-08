import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import { GameSession, ApiError } from "@/models/models";


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

        const { data, error: createError } = await supabase
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
            .single();

        if (createError) {
            const apiError: ApiError = { message: createError.message };
            console.error("Error creating session:", apiError);
            setError(createError.message);
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

        const { data, error: createError } = await supabase
            .from("game_sessions")
            .insert({
                player1_id: user.id,
                player1_creature_id: myCreatureId,
                is_cpu: true,
                status: "active",
                current_turn: user.id,
            })
            .select()
            .single();

        if (createError) {
            const apiError: ApiError = { message: createError.message };
            console.error("Error creating CPU session:", apiError);
            setError(createError.message);
            setLoading(false);
            return;
        }

        setSession(data as GameSession);
        navigate(`/battle/${data.id}`);
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

        const { data, error: acceptError } = await supabase
            .from("game_sessions")
            .update({
                player2_creature_id: myCreatureId,
                status: "active", 
            })
            .eq("id", sessionId)
            .select()
            .single();

        if (acceptError) {
            const apiError: ApiError = { message: acceptError.message };
            console.error("Error accepting session:", apiError);
            setError(acceptError.message);
            setLoading(false);
            return;
        }

        setSession(data as GameSession);
        navigate(`/battle/${data.id}`);
        setLoading(false);
    }

    // Decline a PVP session
    async function declineInvitation(sessionId: number): Promise<void> {
        if (!user) return;
        setLoading(true);
        setError(null);

        const { error: declineError } = await supabase
            .from("game_sessions")
            .update({ status: "declined" })
            .eq("id", sessionId);

        if (declineError) {
            const apiError: ApiError = { message: declineError.message };
            console.error("Error declining session:", apiError);
            setError(declineError.message);
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

        const { data, error: fetchError } = await supabase
            .from("game_sessions")
            .select()
            .eq("id", sessionId)
            .single();

        if (fetchError) {
            const apiError: ApiError = { message: fetchError.message };
            console.error("Error fetching session:", apiError);
            setError(fetchError.message);
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