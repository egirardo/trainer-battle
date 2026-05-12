import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { ROUTES } from '@/routes';
import type { BattleParticipantInfo, Move, PlayerItem } from '@/models/models';

interface UseBattleReturn {
    player: BattleParticipantInfo | null;
    opponent: BattleParticipantInfo | null;
    messages: string[];
    isMyTurn: boolean;
    loading: boolean;
    error: string | null;
    moves: Move[];
    playerItems: PlayerItem[];
    onFight: (moveId: number) => Promise<void>;
    onBag: () => void;
    onRun: () => Promise<void>;
    onUseItem: (itemId: number) => Promise<void>;
}

export function useBattle(sessionId: number): UseBattleReturn {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [player, setPlayer] = useState<BattleParticipantInfo | null>(null);
    const [opponent, setOpponent] = useState<BattleParticipantInfo | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [opponentUserId, setOpponentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [moves, setMoves] = useState<Move[]>([]);
    const [playerItems, setPlayerItems] = useState<PlayerItem[]>([]);

    useEffect(() => {
        if (!user) return;

        async function loadBattle() {
            if (!user) return;
            try {
                // 1. Fetch the game session
                const { data: session, error: sessionErr } = await supabase
                    .from('game_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .single();
                if (sessionErr || !session) throw new Error(sessionErr?.message ?? 'Session not found');

                const isPlayer1 = session.player1_id === user.id;
                const isPlayer2 = session.player2_id === user.id;
                if (!isPlayer1 && !isPlayer2) throw new Error('You are not a participant in this session');

                const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id;
                const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id;

                if (!myCreatureId || !opponentCreatureId) throw new Error('Creature IDs missing from session');
                
                // First turn hardcoded to player1 (session creator)
                setIsMyTurn(session.current_turn === user.id);
                // Used in onRun function to set winner to the opponent id
                setOpponentUserId(isPlayer1 ? session.player2_id : session.player1_id);

                // 2. Fetch both player_creatures joined with creatures
                const [myPCResult, oppPCResult] = await Promise.all([
                    supabase
                        .from('player_creatures')
                        .select('*, creatures(*)')
                        .eq('id', myCreatureId)
                        .single(),
                    supabase
                        .from('player_creatures')
                        .select('*, creatures(*)')
                        .eq('id', opponentCreatureId)
                        .single(),
                ]);
                if (myPCResult.error || !myPCResult.data) throw new Error('Could not load your creature');
                if (oppPCResult.error || !oppPCResult.data) throw new Error('Could not load opponent creature');

                const myPC = myPCResult.data;
                const oppPC = oppPCResult.data;
                const myCreature = myPC.creatures as { name: string; type: string; image: string; base_hp: number };
                const oppCreature = oppPC.creatures as { name: string; type: string; image: string; base_hp: number };

                // 3. Fetch current battle state for live HP values
                const { data: battleState } = await supabase
                    .from('battle_state')
                    .select('player1_hp, player2_hp, last_move_description')
                    .eq('session_id', sessionId)
                    .single();

                const myHp = (isPlayer1 ? battleState?.player1_hp : battleState?.player2_hp) ?? myPC.current_hp ?? 0;
                const oppHp = (isPlayer1 ? battleState?.player2_hp : battleState?.player1_hp) ?? oppPC.current_hp ?? 0;

                if (battleState?.last_move_description) {
                    setMessages([battleState.last_move_description]);
                }

                // TODO: replace base_hp with a proper max HP formula (level scaling)
                setPlayer({
                    name: myPC.nickname ?? myCreature.name,
                    level: myPC.level ?? 1,
                    currentHp: myHp,
                    maxHp: myCreature.base_hp,
                    creatureImage: myCreature.image,
                    creatureType: myCreature.type as 'fire' | 'water' | 'grass',
                });
                setOpponent({
                    name: oppCreature.name,
                    level: oppPC.level ?? 1,
                    currentHp: oppHp,
                    maxHp: oppCreature.base_hp,
                    creatureImage: oppCreature.image,
                    creatureType: oppCreature.type as 'fire' | 'water' | 'grass',
                });

                // 4. Fetch moves available to the player's creature
                const { data: movesData } = await supabase
                    .from('creature_moves')
                    .select('moves(*)')
                    .eq('creature_id', myPC.creature_id);
                if (movesData) {
                    setMoves(movesData.map((row: { moves: unknown }) => row.moves as Move));
                }

                // 5. Fetch player's bag items
                const { data: itemsData } = await supabase
                    .from('player_items')
                    .select('id, item_id, quantity, items(name, description, effect, price)')
                    .eq('player_id', user.id)
                    .gt('quantity', 0);
                if (itemsData) {
                    setPlayerItems(
                        itemsData
                            .filter((row) => row.items !== null)
                            .map((row) => {
                                const item = row.items as { name: string; description: string; effect: number; price: number };
                                return {
                                    id: row.item_id,
                                    name: item.name ?? '',
                                    description: item.description ?? '',
                                    effect: item.effect ?? '',
                                    price: item.price ?? 0,
                                    quantity: row.quantity ?? 0,
                                };
                            })
                    );
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        loadBattle();

        const channel = supabase
            .channel(`battle:${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'battle_state',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    const state = payload.new as {
                        player1_hp: number;
                        player2_hp: number;
                        last_move_description: string | null;
                        is_finished: boolean;
                    };
                    // TODO: determine which slot (1 or 2) is "me" and update accordingly
                    if (state.last_move_description) {
                        setMessages((prev) => [...prev, state.last_move_description!]);
                    }
                    if (state.is_finished) {
                        navigate(ROUTES.battleResult);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    // Default schema
                    schema: 'public',
                    table: 'game_sessions',
                    filter: `id=eq.${sessionId}`,
                },
                (payload) => {
                    const session = payload.new as { current_turn: string };
                    setIsMyTurn(session.current_turn === user.id);
                }
            )
            .subscribe();

        return () => { channel.unsubscribe(); };
    //Prevents the subscription from re-running on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, sessionId, user?.id]);

    async function onFight(_moveId: number) {
        if (!user || !isMyTurn) return;
        // TODO: call Supabase edge function 'execute-move'
        // await supabase.functions.invoke('execute-move', { body: { sessionId, moveId: _moveId, userId: user.id } });
    }

    function onBag() {}

    async function onUseItem(_itemId: number) {
        if (!user || !isMyTurn) return;
        // TODO: decrement player_items.quantity and apply item effect via edge function
    }

    async function onRun() {
        if (!user) return;
        await supabase
            .from('game_sessions')
            .update({ status: 'finished', winner_id: opponentUserId })
            .eq('id', sessionId);
        navigate(ROUTES.battleResult);
    }

    return { player, opponent, messages, isMyTurn, loading, error, moves, playerItems, onFight, onBag, onRun, onUseItem };
}
