import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchFromSupabase } from "@/lib/fetchSupabase";
import type { Tables } from "@/types/database.types";
import type { ApiError } from "@/models/models";

type Creature = Tables<"creatures">;
type Move = Tables<"moves">;
type Item = Tables<"items">;

export function useAdmin() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Creatures
    async function addCreature(creature: Omit<Creature, 'id'>): Promise<Creature | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Creature>(() =>
            supabase.from('creatures').insert(creature).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function updateCreature(id: number, creature: Partial<Omit<Creature, 'id'>>): Promise<Creature | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Creature>(() =>
            supabase.from('creatures').update(creature).eq('id', id).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function deleteCreature(id: number): Promise<boolean> {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
            .from('creatures')
            .delete()
            .eq('id', id);

        setLoading(false);
        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting creature:', apiError);
            setError(deleteError.message);
            return false;
        }
        return true;
    }

    // Moves
    async function addMove(move: Omit<Move, 'id'>): Promise<Move | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Move>(() =>
            supabase.from('moves').insert(move).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function updateMove(id: number, move: Partial<Omit<Move, 'id'>>): Promise<Move | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Move>(() =>
            supabase.from('moves').update(move).eq('id', id).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function deleteMove(id: number): Promise<boolean> {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
            .from('moves')
            .delete()
            .eq('id', id);

        setLoading(false);
        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting move:', apiError);
            setError(deleteError.message);
            return false;
        }
        return true;
    }

    // Items
    async function addItem(item: Omit<Item, 'id'>): Promise<Item | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Item>(() =>
            supabase.from('items').insert(item).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function updateItem(id: number, item: Partial<Omit<Item, 'id'>>): Promise<Item | null> {
        setLoading(true);
        setError(null);

        const { data, error } = await fetchFromSupabase<Item>(() =>
            supabase.from('items').update(item).eq('id', id).select().single()
        );

        setLoading(false);
        if (error) { setError(error.message); return null; }
        return data;
    }

    async function deleteItem(id: number): Promise<boolean> {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        setLoading(false);
        if (deleteError) {
            const apiError: ApiError = { message: deleteError.message };
            console.error('Error deleting item:', apiError);
            setError(deleteError.message);
            return false;
        }
        return true;
    }

    return {
        loading,
        error,
        addCreature, updateCreature, deleteCreature,
        addMove, updateMove, deleteMove,
        addItem, updateItem, deleteItem,
    };
}