import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const typeChart: Record<string, Record<string, number>> = {
    fire:  { fire: 1,   water: 0.5, grass: 2   },
    water: { fire: 2,   water: 1,   grass: 0.5 },
    grass: { fire: 0.5, water: 2,   grass: 1   },
}

function getTypeMultiplier(attackerType: string, defenderType: string): number {
    return typeChart[attackerType]?.[defenderType] ?? 1
}

function calculateDamage(power: number, attack: number, defence: number, attackerType: string, defenderType: string): number {
    const base = (power * attack) / defence
    const multiplier = getTypeMultiplier(attackerType, defenderType)
    const randomFactor = 0.85 + Math.random() * 0.15
    return Math.max(1, Math.floor(base * multiplier * randomFactor))
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const playerId = user.id

        const rawBody = await req.text()
        const { sessionId, itemId } = JSON.parse(rawBody)

        if (!sessionId || !itemId) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Verify ownership and quantity
        const { data: playerItem, error: piErr } = await supabase
            .from('player_items')
            .select('id, quantity, items(name, description, on_use, effect, effect_type)')
            .eq('player_id', playerId)
            .eq('item_id', itemId)
            .single()

        if (piErr || !playerItem || (playerItem.quantity ?? 0) <= 0) {
            return new Response(
                JSON.stringify({ error: 'Item not available' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const itemData = playerItem.items as { name: string; description: string | null; on_use: string | null; effect: number | null; effect_type: string | null } | null
        const itemEffect = itemData?.effect ?? 0
        const effectType = itemData?.effect_type ?? 'heal'
        const itemDescription = itemData?.on_use ?? ("Used " + (itemData?.name ?? 'an item'))

        // Fetch session and battle state
        const [{ data: session, error: sessionErr }, { data: battleState, error: stateErr }] = await Promise.all([
            supabase.from('game_sessions').select('*').eq('id', sessionId).single(),
            supabase.from('battle_state').select('*').eq('session_id', sessionId).single(),
        ])

        if (sessionErr || !session || stateErr || !battleState) {
            return new Response(
                JSON.stringify({ error: 'Session or battle state not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const isPlayer1 = session.player1_id === playerId
        const isPlayer2 = session.player2_id === playerId
        
         if (!isPlayer1 && !isPlayer2) {
             return new Response(
                 JSON.stringify({ error: 'Player is not a participant in this session' }),
                 { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
             )
         }

        if (session.status !== 'active') {
            return new Response(
                JSON.stringify({ error: 'Battle is not active' }),
                { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const { data: claimedRows } = await supabase
            .from('game_sessions')
            .update({ current_turn: null })
            .eq('id', sessionId)
            .eq('current_turn', playerId)
            .select('id')

        if (!claimedRows || claimedRows.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Not your turn' }),
                { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id
        if (!myCreatureId) {
            return new Response(
                JSON.stringify({ error: 'Player creature ID missing' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const { data: myPC, error: myPCErr } = await supabase
            .from('player_creatures')
            .select('*, creatures(base_hp, type)')
            .eq('id', myCreatureId)
            .single()

        if (myPCErr || !myPC) {
            return new Response(
                JSON.stringify({ error: 'Could not fetch player creature' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const myCreature = myPC.creatures as { base_hp: number; type: string }
        const maxHp = myCreature.base_hp ?? 100
        const currentMyHp = (isPlayer1 ? battleState.player1_hp : battleState.player2_hp) ?? 0
        const currentOppHp = (isPlayer1 ? battleState.player2_hp : battleState.player1_hp) ?? 0

        // Current modifier values — we'll mutate these based on the item and CPU counter-attack
        let newP1AttackMod: number = battleState.player1_attack_modifier ?? 0
        let newP2AttackMod: number = battleState.player2_attack_modifier ?? 0
        let newP1DefMod: number = battleState.player1_defence_modifier ?? 0
        let newP2DefMod: number = battleState.player2_defence_modifier ?? 0

        let finalMyHp = currentMyHp
        let finalOppHp = currentOppHp

        // Apply item effect
        if (effectType === 'heal') {
            const healAmount = Math.min(itemEffect, maxHp - currentMyHp)
            finalMyHp = currentMyHp + healAmount
        } else if (effectType === 'attack_boost') {
            if (isPlayer1) newP1AttackMod += itemEffect
            else newP2AttackMod += itemEffect
        } else if (effectType === 'defence_boost') {
            if (isPlayer1) newP1DefMod += itemEffect
            else newP2DefMod += itemEffect
        }

        const { data: myProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', playerId)
            .single()
        const playerPrefix = `${myProfile?.username ?? 'You'}: `

        const descriptions: string[] = [`${playerPrefix}${itemDescription}`]
        let isFinished = false

        // CPU counter-attack — apply (and consume) the player's defence modifier
        if (session.is_cpu && session.cpu_creature_id) {
            const myDefenceMod = isPlayer1 ? newP1DefMod : newP2DefMod

            const { data: cpuC } = await supabase
                .from('creatures')
                .select('id, type, base_attack, base_defence')
                .eq('id', session.cpu_creature_id)
                .single()

            if (cpuC) {
                const { data: cpuMoves } = await supabase
                    .from('creature_moves')
                    .select('move_id')
                    .eq('creature_id', cpuC.id)

                if (cpuMoves && cpuMoves.length > 0) {
                    const randomMoveId = cpuMoves[Math.floor(Math.random() * cpuMoves.length)].move_id
                    const { data: cpuMove } = await supabase
                        .from('moves').select('*').eq('id', randomMoveId).single()

                    if (cpuMove) {
                        const cpuDamage = calculateDamage(
                            cpuMove.power ?? 0,
                            cpuC.base_attack ?? 1,
                            (myPC.defence ?? 1) + myDefenceMod,
                            cpuC.type ?? 'fire',
                            myCreature.type
                        )
                        finalMyHp = Math.max(0, finalMyHp - cpuDamage)
                        isFinished = finalMyHp <= 0
                        descriptions.push(`CPU's ${cpuMove.name} dealt ${cpuDamage} damage!`)
                    }
                }
            }
        }

        const newPlayer1Hp = isPlayer1 ? finalMyHp : finalOppHp
        const newPlayer2Hp = isPlayer1 ? finalOppHp : finalMyHp

        // Decrement quantity and update battle state in parallel
        await Promise.all([
            supabase
                .from('player_items')
                .update({ quantity: playerItem.quantity - 1 })
                .eq('id', playerItem.id)
                .gt('quantity', 0),
            supabase
                .from('battle_state')
                .update({
                    player1_hp: newPlayer1Hp,
                    player2_hp: newPlayer2Hp,
                    player1_attack_modifier: newP1AttackMod,
                    player2_attack_modifier: newP2AttackMod,
                    player1_defence_modifier: newP1DefMod,
                    player2_defence_modifier: newP2DefMod,
                    turn_number: (battleState.turn_number ?? 0) + 1,
                    last_move_description: descriptions.join('\n'),
                    is_finished: isFinished,
                })
                .eq('session_id', sessionId),
        ])

        if (isFinished) {
            await supabase
                .from('game_sessions')
                .update({ status: 'finished', winner_id: null })
                .eq('id', sessionId)

            await supabase.rpc('increment_player_stats', {
                p_player_id: playerId,
                p_wins: 0,
                p_losses: 1,
                p_battles: 1,
            })
        } else {
            const nextTurn = session.is_cpu
                ? playerId
                : (isPlayer1 ? session.player2_id : session.player1_id)
            await supabase
                .from('game_sessions')
                .update({ current_turn: nextTurn })
                .eq('id', sessionId)
        }

        return new Response(
            JSON.stringify({ descriptions, newPlayer1Hp, newPlayer2Hp, isFinished }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }
})
