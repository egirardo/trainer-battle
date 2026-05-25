import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { BattleMessage, BattleParticipantInfo, ItemEffectType, Move, PlayerItem } from '@/models/models';
import { getCreatureImage } from '@/lib/creatureImages';

interface UseBattleReturn {
    player: BattleParticipantInfo | null;
    opponent: BattleParticipantInfo | null;
    messages: BattleMessage[];
    isMyTurn: boolean;
    isCpu: boolean;
    timeRemaining: number;
    loading: boolean;
    error: string | null;
    moves: Move[];
    playerItems: PlayerItem[];
    onFight: (moveId: number) => Promise<void>;
    onBag: () => void;
    onRun: () => Promise<void>;
    onUseItem: (itemId: number) => Promise<void>;
}

export const TURN_DURATION_SECONDS = 45;

export function useBattle(sessionId: number): UseBattleReturn {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isPlayer1Ref = useRef<boolean>(false)
    const isCpuRef = useRef<boolean>(false)
    const [isCpu, setIsCpu] = useState(false);
    const [player, setPlayer] = useState<BattleParticipantInfo | null>(null);
    const [opponent, setOpponent] = useState<BattleParticipantInfo | null>(null);
    const [messages, setMessages] = useState<BattleMessage[]>([]);
    const wasMyMoveRef = useRef(false);
    const submittingRef = useRef(false);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(TURN_DURATION_SECONDS);
    const skipTurnRef = useRef<() => Promise<void>>(() => Promise.resolve());
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
                setIsCpu(session.is_cpu)

                const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id;
                if (!myCreatureId) throw new Error('Creature IDs missing from session');

                setIsMyTurn(session.is_cpu ? true : session.current_turn === user.id);
                setOpponentUserId(isPlayer1 ? session.player2_id : session.player1_id);

                // 2. Fetch player's creature, battle state, and trainer profile in parallel
                const [myPCResult, battleStateResult, myProfileResult, configResult] = await Promise.all([
                    supabase.from('player_creatures').select('*, creatures(*)').eq('id', myCreatureId).single(),
                    supabase.from('battle_state').select('player1_hp, player2_hp, last_move_description').eq('session_id', sessionId).single(),
                    supabase.from('profiles').select('username').eq('id', user.id).single(),
                    supabase.from('game_config').select('stat_boost_hp').single(),
                ]);
                if (myPCResult.error || !myPCResult.data) throw new Error('Could not load your creature');

                const myPC = myPCResult.data;
                const myCreature = myPC.creatures as { name: string; type: string; image: string; base_hp: number };
                const battleState = battleStateResult.data;
                const myTrainerName = myProfileResult.data?.username ?? 'You';

                const myHp = (isPlayer1 ? battleState?.player1_hp : battleState?.player2_hp) ?? myCreature.base_hp;
                const oppBattleHp = (isPlayer1 ? battleState?.player2_hp : battleState?.player1_hp);

                if (battleState?.last_move_description) {
                    const lines = battleState.last_move_description.split('\n');
                    const tagged: BattleMessage[] = session.is_cpu
                        ? lines.map(text => ({ text, side: text.startsWith("CPU's ") ? 'opponent' as const : 'player' as const }))
                        : lines.map(text => ({ text, side: session.current_turn !== user.id ? 'player' as const : 'opponent' as const }));
                    setMessages(tagged);
                }

                setPlayer({
                    name: myPC.nickname ?? myCreature.name,
                    trainerName: myTrainerName,
                    level: myPC.level ?? 1,
                    currentHp: myHp,
                    maxHp: myPC.current_hp ?? myCreature.base_hp,
                    creatureImage: getCreatureImage(myCreature.image),
                    creatureType: myCreature.type as 'fire' | 'water' | 'grass',
                });

                // 3. Load opponent — from creatures directly for CPU, from player_creatures for PVP
                if (session.is_cpu && session.cpu_creature_id) {
                    const { data: cpuCreature, error: cpuErr } = await supabase
                        .from('creatures')
                        .select('name, type, image, base_hp')
                        .eq('id', session.cpu_creature_id)
                        .single();
                    if (cpuErr || !cpuCreature) throw new Error('Could not load CPU creature');
                    const playerLevel = myPC.level ?? 1;
                    const statBoostHp = configResult.data?.stat_boost_hp ?? 25;
                    const cpuMaxHp = (cpuCreature.base_hp ?? 100) + (playerLevel - 1) * statBoostHp;
                    setOpponent({
                        name: cpuCreature.name ?? 'CPU',
                        trainerName: 'CPU',
                        level: playerLevel,
                        currentHp: oppBattleHp ?? cpuMaxHp,
                        maxHp: cpuMaxHp,
                        creatureImage: getCreatureImage(cpuCreature.image ?? ''),
                        creatureType: cpuCreature.type as 'fire' | 'water' | 'grass',
                    });
                } else {
                    const opponentId = isPlayer1 ? session.player2_id : session.player1_id;
                    const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id;
                    if (!opponentCreatureId) throw new Error('Opponent creature ID missing');
                    const [oppPCResult, oppProfileResult] = await Promise.all([
                        supabase.from('player_creatures').select('*, creatures(*)').eq('id', opponentCreatureId).single(),
                        opponentId ? supabase.from('profiles').select('username').eq('id', opponentId).single() : Promise.resolve({ data: null }),
                    ]);
                    if (oppPCResult.error || !oppPCResult.data) throw new Error('Could not load opponent creature');
                    const oppPC = oppPCResult.data;
                    const oppCreature = oppPC.creatures as { name: string; type: string; image: string; base_hp: number };
                    setOpponent({
                        name: oppCreature.name,
                        trainerName: oppProfileResult.data?.username ?? 'Opponent',
                        level: oppPC.level ?? 1,
                        currentHp: oppBattleHp ?? oppCreature.base_hp,
                        maxHp: oppPC.current_hp ?? oppCreature.base_hp,
                        creatureImage: getCreatureImage(oppCreature.image),
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
                    .select('id, item_id, quantity, items(name, description, on_use, effect, effect_type, price)')
                    .eq('player_id', user.id)
                    .gt('quantity', 0);
                if (itemsData) {
                    setPlayerItems(
                        itemsData
                            .filter((row) => row.items !== null)
                            .map((row) => {
                                const item = row.items as { name: string; description: string; on_use: string | null; effect: number; effect_type: ItemEffectType; price: number };
                                return {
                                    id: row.item_id,
                                    name: item.name ?? '',
                                    description: item.description ?? '',
                                    on_use: item.on_use ?? null,
                                    effect: item.effect ?? 0,
                                    effect_type: item.effect_type ?? 'heal',
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
            .channel(`battle:${sessionId}`)
            .on('postgres_changes', {
                filter: `session_id=eq.${sessionId}`,
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
                
                const myNewHp: number = isPlayer1Ref.current ? state.player1_hp : state.player2_hp;
                const oppNewHp: number = isPlayer1Ref.current ? state.player2_hp : state.player1_hp;
                setPlayer(prev => prev ? { ...prev, currentHp: myNewHp } : null)
                setOpponent(prev => prev ? { ...prev, currentHp: oppNewHp } : null)
                if (state.last_move_description) {
                    if (!wasMyMoveRef.current) {
                        const lines = state.last_move_description.split('\n')
                        const tagged: BattleMessage[] = lines.map(text => ({ text, side: 'opponent' as const }))
                        setMessages(prev => [...prev, ...tagged])
                    }
                    wasMyMoveRef.current = false
                }
                if (state.is_finished) {
                    void navigateRef.current(`/battle-result/${sessionId}`);
                }
            })
            .on('postgres_changes', {
                filter: `id=eq.${sessionId}`,
                event: 'UPDATE',
                schema: 'public',
                table: 'game_sessions',
            }, (payload) => {
                const session = payload.new as { current_turn: string };
                if (userIdRef.current) {
                    submittingRef.current = false
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
    }, [sessionId]);

    async function onSkipTurn(): Promise<void> {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setIsMyTurn(false);
        wasMyMoveRef.current = true;

        type InvokeError = { message: string; context?: Response };
        const { data, error } = await supabase.functions.invoke('skip-turn', {
            body: { sessionId: sessionIdRef.current },
        }) as { data: { message: string } | null; error: InvokeError | null };

        if (error) {
            let message = error.message;
            let turnAlreadyResolved = false;

            if (error.context instanceof Response) {
                turnAlreadyResolved = error.context.status === 409;
                try {
                    const payload = await error.context.clone().json() as { error?: string };
                    message = payload.error ?? message;
                } catch {
                    const fallback = await error.context.clone().text();
                    if (fallback) message = fallback;
                }
            }

            setError(message);
            submittingRef.current = false;
            if (!turnAlreadyResolved) setIsMyTurn(true);
            return;
        }

        if (data?.message) {
            setMessages(prev => [...prev, { text: data.message, side: 'neutral' as const }]);
        }
        submittingRef.current = false;
    }

    skipTurnRef.current = onSkipTurn;

    useEffect(() => {
        if (!isMyTurn || isCpuRef.current) {
            setTimeRemaining(TURN_DURATION_SECONDS);
            return;
        }

        setTimeRemaining(TURN_DURATION_SECONDS);
        const start = Date.now();
        let fired = false;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            const remaining = Math.max(0, TURN_DURATION_SECONDS - elapsed);
            setTimeRemaining(remaining);
            if (remaining === 0 && !fired) {
                fired = true;
                clearInterval(interval);
                void skipTurnRef.current();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isMyTurn]);

    async function onFight(moveId: number): Promise<void> {
        if (!user || !isMyTurn || submittingRef.current) return;
        submittingRef.current = true
        setIsMyTurn(false)

        type InvokeError = { message: string; context?: Response };
        const SESSION_REFRESH_BUFFER_SECONDS = 60;

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
            setError(sessionError.message)
            submittingRef.current = false
            setIsMyTurn(true)
            return
        }

        let session = sessionData?.session ?? null
        const nowInSeconds = Math.floor(Date.now() / 1000)
        const expiresAt = session?.expires_at ?? 0
        const shouldRefresh =
            !session?.access_token ||
            (expiresAt > 0 && expiresAt - nowInSeconds <= SESSION_REFRESH_BUFFER_SECONDS)

        if (shouldRefresh) {
            const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
                setError(`Session refresh failed: ${refreshError.message}`)
                submittingRef.current = false
                setIsMyTurn(true)
                return
            }
            session = refreshedData.session ?? null
        }

        const accessToken = session?.access_token
        if (!accessToken) {
            setError('No active session')
            submittingRef.current = false
            setIsMyTurn(true)
            return
        }

        wasMyMoveRef.current = true
        const { data, error } = await supabase.functions.invoke('resolve-turn', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: { sessionId, playerId: user.id, moveId }
        }) as { data: { descriptions: string[]; newPlayer1Hp: number; newPlayer2Hp: number; isFinished: boolean; winnerId: string | null; xpGained: number; creditsEarned: number; newLevel: number; leveledUp: boolean } | null; error: InvokeError | null };

        if (error) {
            let message = error.message

            if (error.context instanceof Response) {
                try {
                    const payload = await error.context.clone().json() as { error?: string }
                    message = payload.error ?? message
                } catch {
                    const fallback = await error.context.clone().text()
                    if (fallback) {
                        message = fallback
                    }
                }
            }

            setError(message)
            submittingRef.current = false
            setIsMyTurn(true)
            return
        }
        if (data) {
            const myNewHp = isPlayer1Ref.current ? data.newPlayer1Hp : data.newPlayer2Hp
            const oppNewHp = isPlayer1Ref.current ? data.newPlayer2Hp : data.newPlayer1Hp
            setPlayer(prev => prev ? { ...prev, currentHp: myNewHp } : null)
            setOpponent(prev => prev ? { ...prev, currentHp: oppNewHp } : null)
            if (data.descriptions?.length) {
                const tagged: BattleMessage[] = isCpuRef.current
                    ? data.descriptions.map(text => ({ text, side: text.startsWith("CPU's ") ? 'opponent' as const : 'player' as const }))
                    : data.descriptions.map(text => ({ text, side: 'player' as const }))
                setMessages(prev => [...prev, ...tagged])
            }
            if (data.isFinished) {
                sessionStorage.setItem(`battle-result-${sessionId}`, JSON.stringify({
                    xpGained: data.xpGained,
                    creditsEarned: data.creditsEarned,
                    newLevel: data.newLevel,
                    leveledUp: data.leveledUp,
                    creditsGained: data.creditsGained,
                }))
                void navigate(`/battle-result/${sessionId}`)
                return
            }
        }

        if (isCpuRef.current) {
            submittingRef.current = false
            setIsMyTurn(true)
        }
    }

    function onBag() {}

    async function onUseItem(itemId: number) {
        if (!user || !isMyTurn) return;
        setIsMyTurn(false);

        type UseItemResponse = { descriptions: string[]; newPlayer1Hp: number; newPlayer2Hp: number; isFinished: boolean };
        type InvokeResponse = { data: UseItemResponse | null; error: { message: string } | null };
        wasMyMoveRef.current = true
        const { data, error } = await supabase.functions.invoke('use-item', {
            body: { sessionId, playerId: user.id, itemId }
        }) as InvokeResponse;

        if (error) {
            setError(error.message);
            setIsMyTurn(true);
            return;
        }

        if (data) {
            const myNewHp = isPlayer1Ref.current ? data.newPlayer1Hp : data.newPlayer2Hp;
            const oppNewHp = isPlayer1Ref.current ? data.newPlayer2Hp : data.newPlayer1Hp;
            setPlayer(prev => prev ? { ...prev, currentHp: myNewHp } : null);
            setOpponent(prev => prev ? { ...prev, currentHp: oppNewHp } : null);
            if (data.descriptions?.length) {
                const tagged: BattleMessage[] = isCpuRef.current
                    ? data.descriptions.map(text => ({ text, side: text.startsWith("CPU's ") ? 'opponent' as const : 'player' as const }))
                    : data.descriptions.map(text => ({ text, side: 'player' as const }))
                setMessages(prev => [...prev, ...tagged])
            }
        }

        setPlayerItems(prev =>
            prev
                .map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item)
                .filter(item => item.quantity > 0)
        );

        if (isCpuRef.current) {
            setIsMyTurn(true);
        }
    }

    async function onRun(): Promise<void> {
        if (!user) return;

        const { data: forfeitData, error: forfeitError } = await supabase.functions.invoke<{ creditsGained: number }>('forfeit', {
            body: { sessionId },
        });

        if (forfeitError) {
            setError(forfeitError.message);
            return;
        }

        sessionStorage.setItem(`battle-result-${sessionId}`, JSON.stringify({
            xpGained: 0,
            newLevel: null,
            leveledUp: false,
            creditsGained: forfeitData?.creditsGained ?? 0,
        }));

        void navigate(`/battle-result/${sessionId}`);
    }

    return { player, opponent, messages, isMyTurn, isCpu, timeRemaining, loading, error, moves, playerItems, onFight, onBag, onRun, onUseItem };
}
