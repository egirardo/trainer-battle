import { useEffect, useState, useRef } from 'react';
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
    const isPlayer1Ref = useRef<boolean>(false)
    const isCpuRef = useRef<boolean>(false)
    const [player, setPlayer] = useState<BattleParticipantInfo | null>(null);
    const [opponent, setOpponent] = useState<BattleParticipantInfo | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [opponentUserId, setOpponentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [moves, setMoves] = useState<Move[]>([]);
    const [playerItems, setPlayerItems] = useState<PlayerItem[]>([]);
    const navigateRef = useRef(navigate);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const sessionIdRef = useRef(sessionId);
    const userIdRef = useRef(user?.id);
    

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
                if (!isPlayer1 && !isPlayer2 && !session.is_cpu) throw new Error('You are not a participant in this session');

                isPlayer1Ref.current = isPlayer1
                isCpuRef.current = session.is_cpu

                const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id;
                if (!myCreatureId) throw new Error('Creature IDs missing from session');

                setIsMyTurn(session.is_cpu ? true : session.current_turn === user.id);
                setOpponentUserId(isPlayer1 ? session.player2_id : session.player1_id);

                // 2. Fetch player's creature and battle state in parallel
                const [myPCResult, battleStateResult] = await Promise.all([
                    supabase.from('player_creatures').select('*, creatures(*)').eq('id', myCreatureId).single(),
                    supabase.from('battle_state').select('player1_hp, player2_hp, last_move_description').eq('session_id', sessionId).single(),
                ]);
                if (myPCResult.error || !myPCResult.data) throw new Error('Could not load your creature');

                const myPC = myPCResult.data;
                const myCreature = myPC.creatures as { name: string; type: string; image: string; base_hp: number };
                const battleState = battleStateResult.data;

                const myHp = (isPlayer1 ? battleState?.player1_hp : battleState?.player2_hp) ?? myPC.current_hp ?? 0;
                const oppHp = (isPlayer1 ? battleState?.player2_hp : battleState?.player1_hp) ?? 0;

                if (battleState?.last_move_description) {
                    setMessages([battleState.last_move_description]);
                }

                setPlayer({
                    name: myPC.nickname ?? myCreature.name,
                    level: myPC.level ?? 1,
                    currentHp: myHp,
                    maxHp: myCreature.base_hp,
                    creatureImage: myCreature.image,
                    creatureType: myCreature.type as 'fire' | 'water' | 'grass',
                });

                // 3. Load opponent — from creatures directly for CPU, from player_creatures for PVP
                if (session.is_cpu && session.cpu_creature_id) {
                    const { data: cpuCreature, error: cpuErr } = await supabase
                        .from('creatures')
                        .select('name, type, image, base_hp')
                        .eq('id', session.cpu_creature_id as number)
                        .single();
                    if (cpuErr || !cpuCreature) throw new Error('Could not load CPU creature');
                    setOpponent({
                        name: cpuCreature.name ?? 'CPU',
                        level: 1,
                        currentHp: oppHp,
                        maxHp: cpuCreature.base_hp ?? 100,
                        creatureImage: cpuCreature.image ?? '',
                        creatureType: cpuCreature.type as 'fire' | 'water' | 'grass',
                    });
                } else {
                    const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id;
                    if (!opponentCreatureId) throw new Error('Opponent creature ID missing');
                    const { data: oppPC, error: oppErr } = await supabase
                        .from('player_creatures')
                        .select('*, creatures(*)')
                        .eq('id', opponentCreatureId)
                        .single();
                    if (oppErr || !oppPC) throw new Error('Could not load opponent creature');
                    const oppCreature = oppPC.creatures as { name: string; type: string; image: string; base_hp: number };
                    setOpponent({
                        name: oppCreature.name,
                        level: oppPC.level ?? 1,
                        currentHp: oppHp,
                        maxHp: oppCreature.base_hp,
                        creatureImage: oppCreature.image,
                        creatureType: oppCreature.type as 'fire' | 'water' | 'grass',
                    });
                }

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
                                    effect: item.effect ?? 0,
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

        void loadBattle();

    }, [sessionId, user]);

    useEffect(() => {
        navigateRef.current = navigate;
        sessionIdRef.current = sessionId;
        userIdRef.current = user?.id;
    }, [navigate, sessionId, user?.id]);

    useEffect(() => {
        channelRef.current = supabase
            .channel(`battle:${sessionIdRef.current}`)
            .on('postgres_changes', {
                filter: `session_id=eq.${sessionIdRef.current}`,
                event: 'UPDATE',
                schema: 'public',
                table: 'battle_state',
            }, (payload) => {
                const state = payload.new as {
                    player1_hp: number;
                    player2_hp: number;
                    last_move_description: string | null;
                    is_finished: boolean;
                }

                const myNewHp = isPlayer1Ref.current ? state.player1_hp : state.player2_hp;
                const oppNewHp = isPlayer1Ref.current ? state.player2_hp : state.player1_hp;
                setPlayer(prev => prev ? { ...prev, currentHp: myNewHp } : null)
                setOpponent(prev => prev ? { ...prev, currentHp: oppNewHp } : null)
                if (state.last_move_description) {
                    setMessages(prev => [...prev, ...state.last_move_description!.split('\n')]);
                }
                // TODO: re-enable when realtime channel stability is fixed for PVP
                if (state.is_finished) {
                    void navigateRef.current(ROUTES.battleResult);
                }
            })
            .on('postgres_changes', {
                filter: `id=eq.${sessionIdRef.current}`,
                event: 'UPDATE',
                schema: 'public',
                table: 'game_sessions',
            }, (payload) => {
                const session = payload.new as { current_turn: string };
                if (userIdRef.current) {
                    setIsMyTurn(session.current_turn === userIdRef.current);
                }
            })
            .subscribe();

        return () => {
            if (channelRef.current) {
                void channelRef.current.unsubscribe()
                channelRef.current = null
            }
        }
    }, []);

    async function onFight(moveId: number): Promise<void> {
        if (!user || !isMyTurn) return;
        setIsMyTurn(false)

        type InvokeResponse = { data: unknown; error: { message: string } | null };
        const { error } = await supabase.functions.invoke('resolve-turn', {
            body: { sessionId, playerId: user.id, moveId }
        }) as InvokeResponse;

        if (error) {
            setError(error.message)
            setIsMyTurn(true)
            return
        }
        if (isCpuRef.current) {
            setIsMyTurn(true)
        }
    }

    function onBag() {}

    async function onUseItem(_itemId: number) {
        if (!user || !isMyTurn) return;
        // TODO: decrement player_items.quantity and apply item effect via edge function
    }

    async function onRun(): Promise<void> {
        if (!user || !opponentUserId) return;
        const { error: runError } = await supabase
            .from('game_sessions')
            .update({ status: 'finished', winner_id: opponentUserId })
            .eq('id', sessionId);

        if (runError) {
            setError(runError.message);
            return
        }
        void navigate(ROUTES.battleResult);
    }

    return { player, opponent, messages, isMyTurn, loading, error, moves, playerItems, onFight, onBag, onRun, onUseItem };
}
