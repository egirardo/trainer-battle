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

        try {
            // Pick a random creature from the DB for the CPU
            const { data: allCreatures, error: creaturesErr } = await supabase
                .from('creatures')
                .select('id, base_hp, base_attack, base_defence, base_speed');

            if (creaturesErr || !allCreatures?.length) {
                setError('Could not load creatures');
                return;
            }

            const cpuCreature = allCreatures[Math.floor(Math.random() * allCreatures.length)];

            // Create a player_creatures row for the CPU creature
            const { data: cpuPC, error: cpuPCErr } = await supabase
                .from('player_creatures')
                .insert({
                    player_id: user.id,
                    creature_id: cpuCreature.id,
                    level: 1,
                    current_hp: cpuCreature.base_hp ?? 100,
                    attack: cpuCreature.base_attack,
                    defence: cpuCreature.base_defence,
                    speed: cpuCreature.base_speed,
                })
                .select()
                .single();

            if (cpuPCErr || !cpuPC) {
                setError('Could not create CPU creature');
                return;
            }

            // Fetch player's current HP
            const { data: myCreature } = await supabase
                .from('player_creatures')
                .select('current_hp')
                .eq('id', myCreatureId)
                .single();

            // Create the game session with both creature IDs set
            const { data: session, error: sessionErr } = await supabase
                .from('game_sessions')
                .insert({
                    player1_id: user.id,
                    player1_creature_id: myCreatureId,
                    player2_creature_id: cpuPC.id,
                    is_cpu: true,
                    status: 'active',
                    current_turn: user.id,
                })
                .select()
                .single();

            if (sessionErr || !session) {
                setError(sessionErr?.message ?? 'Unknown error');
                return;
            }

            // Create battle state with each side's actual HP
            const { error: battleStateError } = await supabase.from('battle_state').insert({
                session_id: session.id,
                player1_hp: myCreature?.current_hp ?? 100,
                player2_hp: cpuCreature.base_hp ?? 100,
                player1_status: 'normal',
                player2_status: 'normal',
                turn_number: 1,
                is_finished: false,
            });

            if (battleStateError) {
                setError(battleStateError.message);
                return;
            }

            setSession(session as GameSession);
            void navigate(`${ROUTES.battle}/${session.id}`);
        } finally {
            setLoading(false);
        }
    }

    // Accept a PVP session
    async function acceptInvitation(sessionId: number, myCreatureId: number
    ): Promise<void> {
        if (!user) return;
        setLoading(true);
        setError(null);

        // Fetch session to get player1 creature
        const { data: sessionData } = await supabase
            .from('game_sessions')
            .select('player1_creature_id')
            .eq('id', sessionId)
            .single();

        if (!sessionData?.player1_creature_id) {
            setError('Could not find opponent creature')
            setLoading(false);
            return;
        }

        // Fetch both creatures current HP
        const [myCreature, opponentCreature] = await Promise.all([
            supabase
                .from('player_creatures')
                .select('current_hp')
                .eq('id', myCreatureId)
                .single(),
            supabase
                .from('player_creatures')
                .select('current_hp')
                .eq('id', sessionData.player1_creature_id)
                .single(),
        ]);

        const { error: battleStateError } = await supabase.from('battle_state').insert({
            session_id: sessionId,
            player1_hp: opponentCreature.data?.current_hp ?? 0,
            player2_hp: myCreature.data?.current_hp ?? 0,
            player1_status: 'normal',
            player2_status: 'normal',
            turn_number: 1,
            is_finished: false,
        });

        if (battleStateError) {
            setError(battleStateError.message);
            setLoading(false);
            return;
        }

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
        void navigate(`${ROUTES.battle}/${data.id}`);
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