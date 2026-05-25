import CreatureFormRow from "../components/molecules/CreatureFormRow";
import MoveFormRow from "../components/molecules/MoveFormRow";
import ItemFormRow from "../components/molecules/ItemFormRow";
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Tables } from "@/types/database.types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { ROUTES } from "@/routes";
import LoadingScreen from '@/components/atoms/LoadingScreen';
import { useNavigate } from "react-router-dom";

type Creature = Tables<'creatures'>;
type Move = Tables<'moves'>;
type Item = Tables<'items'>;
type GameConfig = Tables<'game_config'>;

export default function AdminPanel() {
    const maxVerificationRetries = 3;
    const { profile, loading: authLoading } = useAuth();
    const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verificationTrigger, setVerificationTrigger] = useState(0);
    const [verificationRetries, setVerificationRetries] = useState(0);
    const {
        addCreature, updateCreature, deleteCreature,
        addMove, updateMove, deleteMove,
        addItem, updateItem, deleteItem, 
        error: adminError,
    } = useAdmin();

    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [moves, setMoves] = useState<Move[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [editingCreatureId, setEditingCreatureId] = useState<number | null>(null);
    const [editingMoveId, setEditingMoveId] = useState<number | null>(null);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
    const [editingConfig, setEditingConfig] = useState(false)
    const [configForm, setConfigForm] = useState<Partial<GameConfig>>({})
    const navigate = useNavigate();

    // Gate data fetching behind auth check
    useEffect(() => {
        if (authLoading || !profile?.is_admin) return;

        let ignore = false;

        async function verifyAdmin(): Promise<void> {
            setVerificationError(null);
            setAdminVerified(null);

            const { data, error } = await supabase.functions.invoke<{ isAdmin: boolean }>('verify-is-admin')
            if (ignore) return;

            if (error) {
                setVerificationError('Unable to verify admin access right now. Please try again.');
                return;
            }

            if (!data?.isAdmin) {
                setAdminVerified(false)
                return
            }
            setAdminVerified(true)
        }
        void verifyAdmin();

        return () => { ignore = true; };
    }, [authLoading, profile, verificationTrigger]);

    useEffect(() => {
        if (!adminVerified) return

        let ignore = false;

        async function fetchData() {
            const [cRes, mRes, iRes, gcRes] = await Promise.all([
                supabase.from('creatures').select(),
                supabase.from('moves').select(),
                supabase.from('items').select(),
                supabase.from('game_config').select().single(),
            ]);

            if (ignore) return;

            const err = cRes.error ?? mRes.error ?? iRes.error ?? gcRes.error;
            if (err) {
                setError(err.message);
                return;
            }

            setCreatures(cRes.data ?? []);
            setMoves(mRes.data ?? []);
            setItems(iRes.data ?? []);
            setGameConfig(gcRes.data ?? null);
        }

        void fetchData();

        return () => { ignore = true; };
    }, [adminVerified]);

    if (authLoading) return <LoadingScreen />;
    if (profile === undefined) return <LoadingScreen />;
    if (!profile?.is_admin) return <Navigate to={ROUTES.start} replace />;
    if (verificationError) {
        const canRetryVerification = verificationRetries < maxVerificationRetries;

        return (
            <main>
                <div role='alert'>
                    <p id='admin-verification-error'>{verificationError}</p>
                    {!canRetryVerification && <p>Retry limit reached. Reload the page to try again.</p>}
                </div>
                {canRetryVerification && (
                    <button
                        aria-describedby='admin-verification-error'
                        onClick={() => {
                            setVerificationRetries(prev => prev + 1)
                            setVerificationTrigger(prev => prev + 1)
                        }}
                    >
                        Retry verification
                    </button>
                )}
            </main>
        );
    }
    if (adminVerified === null) return <LoadingScreen message="Verifying admin access..." />;
    if (!adminVerified) return <Navigate to={ROUTES.start} replace />;

    // Creature handlers — use real DB id
    async function handleAddCreature(data: Omit<Creature, 'id'>): Promise<void> {
        const inserted = await addCreature(data);
        if (inserted) setCreatures(prev => [...prev, inserted]);
    }

    async function handleUpdateCreature(id: number, data: Omit<Creature, 'id'>): Promise<void> {
        const updated = await updateCreature(id, data);
        if (updated) {
            setCreatures(prev => prev.map(c => c.id === id ? updated : c));
            setEditingCreatureId(null);
        }
    }

    async function handleDeleteCreature(id: number): Promise<void> {
        const success = await deleteCreature(id);
        if (success) setCreatures(prev => prev.filter(c => c.id !== id));
    }

    // Move handlers — use real DB id
    async function handleAddMove(data: Omit<Move, 'id'>): Promise<void> {
        const inserted = await addMove(data);
        if (inserted) setMoves(prev => [...prev, inserted]);
    }

    async function handleUpdateMove(id: number, data: Omit<Move, 'id'>): Promise<void> {
        const updated = await updateMove(id, data);
        if (updated) {
            setMoves(prev => prev.map(m => m.id === id ? updated : m));
            setEditingMoveId(null);
        }
    }

    async function handleDeleteMove(id: number): Promise<void> {
        const success = await deleteMove(id);
        if (success) setMoves(prev => prev.filter(m => m.id !== id));
    }

    // Item handlers — use real DB id
    async function handleAddItem(data: Omit<Item, 'id'>): Promise<void> {
        const inserted = await addItem(data);
        if (inserted) setItems(prev => [...prev, inserted]);
    }

    async function handleUpdateItem(id: number, data: Omit<Item, 'id'>): Promise<void> {
        const updated = await updateItem(id, data);
        if (updated) {
            setItems(prev => prev.map(i => i.id === id ? updated : i));
            setEditingItemId(null);
        }
    }

    async function handleDeleteItem(id: number): Promise<void> {
        const success = await deleteItem(id);
        if (success) setItems(prev => prev.filter(i => i.id !== id));
    }

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Failed to sign out:', error)
            return
        }
        void navigate(ROUTES.start)
    }

    async function handleUpdateConfig(): Promise<void> {
        if (!gameConfig) return;

        // Validate — filter out NaN values
        const validForm = Object.entries(configForm).reduce<Partial<GameConfig>>((acc, [k, v]) => {
            if (v !== undefined && !Number.isNaN(v)) {
                (acc as Record<string, unknown>)[k] = v
            }
            return acc
        }, {})

        const { data, error } = await supabase
            .from('game_config')
            .update(validForm)
            .eq('id', gameConfig.id)
            .select()
            .single()
        if (error) { setError(error.message); return }
        setGameConfig(data);
        setEditingConfig(false);
    }

    return (
        <main>
            <h1>Admin Panel</h1>
            {error && <p role="alert">{error}</p>}
            {adminError && <p role="alert">{adminError}</p>}

            <section>
                <h2>Creatures</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Type</th>
                            <th>HP</th><th>Attack</th><th>Defence</th>
                            <th>Speed</th><th>Description</th><th>Image</th>
                            <th>Boss</th>
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
                                    <td>{creature.is_boss ? 'Yes' : 'No'}</td>
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

            <section>
                <h2>Moves</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Type</th>
                            <th>Power</th><th>Accuracy</th><th>Effect</th>
                            <th>Description</th><th>Actions</th>
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

            <section>
                <h2>Items</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Description</th>
                            <th>Effect</th><th>Effect Type</th><th>Price</th><th>Actions</th>
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
                                    <td>{item.effect_type}</td>
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

            <section>
                <h2>Game Config</h2>
                {gameConfig && (
                    editingConfig ? (
                        <div>
                            <label>Entry fee (new): <input type="number" step="0.50" value={configForm.entry_fee_new ?? gameConfig.entry_fee_new} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, entry_fee_new: val }))
                                }
                            }} /></label>
                            <label>Entry fee (returning): <input type="number" step="0.50" value={configForm.entry_fee_returning ?? gameConfig.entry_fee_returning} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, entry_fee_returning: val }))
                                }
                            }} /></label>
                            <label>Starting credits (new): <input type="number" value={configForm.credits_new ?? gameConfig.credits_new} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_new: val }))
                                }
                            }} /></label>
                            <label>Starting credits (returning): <input type="number" value={configForm.credits_returning ?? gameConfig.credits_returning} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_returning: val }))
                                }
                            }} /></label>
                            <label>Credits CPU win: <input type="number" value={configForm.credits_cpu_win ?? gameConfig.credits_cpu_win} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_cpu_win: val }))
                                }
                            }} /></label>
                            <label>Credits CPU loss: <input type="number" value={configForm.credits_cpu_loss ?? gameConfig.credits_cpu_loss} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_cpu_loss: val }))
                                }
                            }} /></label>
                            <label>Credits PVP win: <input type="number" value={configForm.credits_pvp_win ?? gameConfig.credits_pvp_win} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_pvp_win: val }))
                                }
                            }} /></label>
                            <label>Credits PVP loss: <input type="number" value={configForm.credits_pvp_loss ?? gameConfig.credits_pvp_loss} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_pvp_loss: val }))
                                }
                            }} /></label>
                            <label>Credits forfeit: <input type="number" value={configForm.credits_forfeit ?? gameConfig.credits_forfeit} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credits_forfeit: val }))
                                }
                            }} /></label>
                            <label>Credit exchange rate: <input type="number" step="0.01" value={configForm.credit_exchange_rate ?? gameConfig.credit_exchange_rate} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, credit_exchange_rate: val }))
                                }
                            }} /></label>
                            <label>Payout rounding: <input type="number" step="0.50" value={configForm.payout_rounding ?? gameConfig.payout_rounding} onChange={e => {
                                const val = e.currentTarget.valueAsNumber
                                if (!Number.isNaN(val)) {
                                    setConfigForm(p => ({ ...p, payout_rounding: val }))
                                }
                            }} /></label>
                            <button onClick={() => void handleUpdateConfig()}>Save</button>
                            <button onClick={() => setEditingConfig(false)}>Cancel</button>
                        </div>
                    ) : (
                        <table>
                            <tbody>
                                <tr><td>Entry fee (new)</td><td>€{gameConfig.entry_fee_new}</td></tr>
                                <tr><td>Entry fee (returning)</td><td>€{gameConfig.entry_fee_returning}</td></tr>
                                <tr><td>Starting credits (new)</td><td>{gameConfig.credits_new}</td></tr>
                                <tr><td>Starting credits (returning)</td><td>{gameConfig.credits_returning}</td></tr>
                                <tr><td>Credits CPU win</td><td>{gameConfig.credits_cpu_win}</td></tr>
                                <tr><td>Credits CPU loss</td><td>{gameConfig.credits_cpu_loss}</td></tr>
                                <tr><td>Credits PVP win</td><td>{gameConfig.credits_pvp_win}</td></tr>
                                <tr><td>Credits PVP loss</td><td>{gameConfig.credits_pvp_loss}</td></tr>
                                <tr><td>Credits forfeit</td><td>{gameConfig.credits_forfeit}</td></tr>
                                <tr><td>Credit exchange rate</td><td>{gameConfig.credit_exchange_rate}</td></tr>
                                <tr><td>Payout rounding</td><td>{gameConfig.payout_rounding}</td></tr>
                            </tbody>
                        </table>
                    )
                )}
                {!editingConfig && (
                    <button onClick={() => {
                        setConfigForm({})
                        setEditingConfig(true)
                    }}>Edit config</button>
                )}
            </section>
            <section>
                <button onClick={() => void handleLogout()}>Logout</button>
            </section>
        </main>
    );
}
