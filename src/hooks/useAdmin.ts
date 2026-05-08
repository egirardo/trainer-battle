import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import type { Tables } from "@/types/database.types";
import type { ApiError } from "@/models/models";

type Creature = Tables<"creatures">;
type Move = Tables<"moves">;
type Item = Tables<"items">;

export function useAdmin(){
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Creatures
    async function addCreature(creature: Omit<Creature, "id">): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('creatures').insert(creature).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function updateCreature(id: number, updates: Partial<Omit<Creature, "id">>): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('creatures').update(updates).eq('id', id).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function deleteCreature(id: number): Promise<void> {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
            .from('creatures')
            .delete()
            .eq('id', id);

        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting creature:', apiError);
            setError(deleteError.message);
        }

        setLoading(false);
    }

    // Moves
    async function addMove(move: Omit<Move, "id">): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('moves').insert(move).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function updateMove(id: number, updates: Partial<Omit<Move, "id">>): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('moves').update(updates).eq('id', id).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function deleteMove(id: number): Promise<void> {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
            .from('moves')
            .delete()
            .eq('id', id);

        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting move:', apiError);
            setError(deleteError.message);
        }

        setLoading(false);
    }

    // Items
    async function addItem(item: Omit<Item, "id">): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('items').insert(item).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function updateItem(id: number, updates: Partial<Omit<Item, "id">>): Promise<void> {
        setLoading(true);
        setError(null);

        const { error } = await fetchFromSupabase(() => 
            supabase.from('items').update(updates).eq('id', id).select().single()
        );

        if (error) setError(error.message);
        setLoading(false);
    }

    async function deleteItem(id: number): Promise<void> {
        setLoading(true);
        setError(null);
        
        const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting item:', apiError);
            setError(deleteError.message);
        }

        setLoading(false);
    }

    return {
        loading,
        error,
        addCreature,
        updateCreature,
        deleteCreature,
        addMove,
        updateMove,
        deleteMove,
        addItem,
        updateItem,
        deleteItem,
    };
}