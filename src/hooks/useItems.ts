import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/models/models";

// Eagerly imports all item sprites so Vite includes them in the build and
// resolves their hashed URLs. The DB stores just the filename (e.g. "health-potion.png").
const itemSprites = import.meta.glob<string>(
    "../assets/sprites/items/*.png",
    { eager: true, import: "default" }
);

function resolveItemImage(filename: unknown): string | undefined {
    if (typeof filename !== "string" || !filename) return undefined;
    const key = Object.keys(itemSprites).find(k => k.endsWith(`/${filename}`));
    return key ? itemSprites[key] : undefined;
}

export function useItems() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            setLoading(true);
            const { data, error } = await supabase.from("items").select("*");

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setItems(
                (data ?? []).map(row => ({
                    id: row.id,
                    name: row.name ?? "",
                    description: row.description ?? "",
                    on_use: row.on_use as string | null,
                    effect: row.effect ?? 0,
                    effect_type: row.effect_type as 'heal' | 'attack_boost' | 'defence_boost',
                    price: row.price ?? 0,
                    image: resolveItemImage(row.image),
                }))
            );
            setLoading(false);
        }

        void fetchItems();
    }, []);

    return { items, loading, error };
}
