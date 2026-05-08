import CreatureFormRow from "../components/molecules/CreatureFormRow";
import MoveFormRow from "../components/molecules/MoveFormRow";
import ItemFormRow from "../components/molecules/ItemFormRow";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from "@/types/database.types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { ROUTES } from "@/routes";

type Creature = Tables<'creatures'>;
type Move = Tables<'moves'>;
type Item = Tables<'items'>;

export default function AdminPanel() {
    const navigate = useNavigate();
    const { profile, loading: authLoading } = useAuth();
    const {
        addCreature, updateCreature, deleteCreature,
        addMove, updateMove, deleteMove,
        addItem, updateItem, deleteItem,
    } = useAdmin();

    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [moves, setMoves] = useState<Move[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [editingCreatureId, setEditingCreatureId] = useState<number | null>(null);
    const [editingMoveId, setEditingMoveId] = useState<number | null>(null);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            const [cRes, mRes, iRes] = await Promise.all([
                supabase.from('creatures').select(),
                supabase.from('moves').select(),
                supabase.from('items').select(),
            ]);

            if (ignore) return;

            const err = cRes.error ?? mRes.error ?? iRes.error;
            if (err) {
                console.error('Failed to fetch admin data:', err);
                setError(err.message);
                return;
            }

            setCreatures(cRes.data ?? []);
            setMoves(mRes.data ?? []);
            setItems(iRes.data ?? []);
        }

        fetchData();
        return () => { ignore = true; };
    }, [authLoading, profile]);

    if (authLoading) return <p>Loading...</p>;

    // Redirect non-admins
    if (!profile?.is_admin) {
        navigate(ROUTES.start);
        return null;
    }

    // Creature handlers
    async function handleAddCreature(data: Omit<Creature, 'id'>): Promise<void> {
        await addCreature(data);
        setCreatures(prev => [...prev, { ...data, id: Date.now() }]);
    }

    async function handleUpdateCreature(id: number, data: Omit<Creature, 'id'>): Promise<void> {
        await updateCreature(id, data);
        setCreatures(prev => prev.map(c => c.id === id ? { ...data, id } : c));
        setEditingCreatureId(null);
    }

    async function handleDeleteCreature(id: number): Promise<void> {
        await deleteCreature(id);
        setCreatures(prev => prev.filter(c => c.id !== id));
    }

    // Move handlers
    async function handleAddMove(data: Omit<Move, 'id'>): Promise<void> {
        await addMove(data);
        setMoves(prev => [...prev, { ...data, id: Date.now() }]);
    }

    async function handleUpdateMove(id: number, data: Omit<Move, 'id'>): Promise<void> {
        await updateMove(id, data);
        setMoves(prev => prev.map(m => m.id === id ? { ...data, id } : m));
        setEditingMoveId(null);
    }

    async function handleDeleteMove(id: number): Promise<void> {
        await deleteMove(id);
        setMoves(prev => prev.filter(m => m.id !== id));
    }

    // Item handlers
    async function handleAddItem(data: Omit<Item, 'id'>): Promise<void> {
        await addItem(data);
        setItems(prev => [...prev, { ...data, id: Date.now() }]);
    }

    async function handleUpdateItem(id: number, data: Omit<Item, 'id'>): Promise<void> {
        await updateItem(id, data);
        setItems(prev => prev.map(i => i.id === id ? { ...data, id } : i));
        setEditingItemId(null);
    }

    async function handleDeleteItem(id: number): Promise<void> {
        await deleteItem(id);
        setItems(prev => prev.filter(i => i.id !== id));
    }

    return (
        <main>
            <h1>Admin Panel</h1>
            {error && <p role="alert">{error}</p>}

            {/* Creatures */}
            <section>
                <h2>Creatures</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>HP</th>
                            <th>Attack</th>
                            <th>Defence</th>
                            <th>Speed</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creatures.map((creature) =>
                            editingCreatureId === creature.id ? (
                                <CreatureFormRow
                                    key={creature.id}
                                    idPrefix={String(creature.id)}
                                    submitLabel="Save"
                                    initialValues={creature}
                                    onSubmit={(data) => handleUpdateCreature(creature.id, data)}
                                />
                            ) : (
                                <tr key={creature.id}>
                                    <td>{creature.id}</td>
                                    <td>{creature.name}</td>
                                    <td>{creature.type}</td>
                                    <td>{creature.base_hp}</td>
                                    <td>{creature.base_attack}</td>
                                    <td>{creature.base_defence}</td>
                                    <td>{creature.base_speed}</td>
                                    <td>{creature.description}</td>
                                    <td>{creature.image}</td>
                                    <td>
                                        <button onClick={() => setEditingCreatureId(creature.id)}>Edit</button>
                                        <button onClick={() => handleDeleteCreature(creature.id)}>Delete</button>
                                    </td>
                                </tr>
                            )
                        )}
                        <CreatureFormRow onSubmit={handleAddCreature} />
                    </tbody>
                </table>
            </section>

            {/* Moves */}
            <section>
                <h2>Moves</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Power</th>
                            <th>Accuracy</th>
                            <th>Effect</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.map((move) =>
                            editingMoveId === move.id ? (
                                <MoveFormRow
                                    key={move.id}
                                    idPrefix={String(move.id)}
                                    submitLabel="Save"
                                    initialValues={move}
                                    onSubmit={(data) => handleUpdateMove(move.id, data)}
                                />
                            ) : (
                                <tr key={move.id}>
                                    <td>{move.id}</td>
                                    <td>{move.name}</td>
                                    <td>{move.type}</td>
                                    <td>{move.power}</td>
                                    <td>{move.accuracy}</td>
                                    <td>{move.effect}</td>
                                    <td>{move.description}</td>
                                    <td>
                                        <button onClick={() => setEditingMoveId(move.id)}>Edit</button>
                                        <button onClick={() => handleDeleteMove(move.id)}>Delete</button>
                                    </td>
                                </tr>
                            )
                        )}
                        <MoveFormRow onSubmit={handleAddMove} />
                    </tbody>
                </table>
            </section>

            {/* Items */}
            <section>
                <h2>Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Effect</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) =>
                            editingItemId === item.id ? (
                                <ItemFormRow
                                    key={item.id}
                                    idPrefix={String(item.id)}
                                    submitLabel="Save"
                                    initialValues={item}
                                    onSubmit={(data) => handleUpdateItem(item.id, data)}
                                />
                            ) : (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.effect}</td>
                                    <td>{item.price}</td>
                                    <td>
                                        <button onClick={() => setEditingItemId(item.id)}>Edit</button>
                                        <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                                    </td>
                                </tr>
                            )
                        )}
                        <ItemFormRow onSubmit={handleAddItem} />
                    </tbody>
                </table>
            </section>
        </main>
    );
}