import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
// Type advantage multiplier
const typeChart: Record<string, Record<string, number>> = {
    fire:  { fire: 1,   water: 0.5, grass: 2   },
    water: { fire: 2,   water: 1,   grass: 0.5 },
    grass: { fire: 0.5, water: 2,   grass: 1   },
}

function getTypeMultiplier(attackerType: string, defenderType: string): number {
    return typeChart[attackerType]?.[defenderType] ?? 1
}

function calculateDamage(
    power: number, 
    attack: number, 
    defence: number, 
    attackerType: string, 
    defenderType: string
): number {
    const base = (power * attack) / defence
    const multiplier = getTypeMultiplier(attackerType, defenderType)
    const randomFactor = 0.85 + Math.random() * 0.15
    return Math.max(1, Math.floor(base * multiplier * randomFactor))
}

function buildDescription(
    moveName: string, 
    damage: number, 
    attackerType: string, 
    defenderType: string, 
    prefix = ''
): string {
    const multiplier = getTypeMultiplier(attackerType, defenderType)
    const effectiveness = multiplier > 1 ? " It's super effective!" : multiplier < 1 ? " It's not very effective..." : ""
    return `${prefix}${moveName} dealt ${damage} damage!${effectiveness}`
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const rawBody = await req.text()
        const { sessionId, playerId, moveId } = JSON.parse(rawBody)

        if (!sessionId || !playerId || !moveId) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Fetch game session
        const { data: session, error: sessionErr } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionErr || !session) {
            return new Response(
                JSON.stringify({ error: 'Game session not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Fetch current battle state
        const { data: battleState, error: stateErr } = await supabase
            .from('battle_state')
            .select('*')
            .eq('session_id', sessionId)
            .single()

        if (stateErr || !battleState) {
            return new Response(
                JSON.stringify({ error: 'Battle state not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Determine player's creature ID
        const isPlayer1 = session.player1_id === playerId
        const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id

        if (!myCreatureId) {
            return new Response(
                JSON.stringify({ error: 'Player creature ID missing' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Fetch player's creature
        const myPCResult = await supabase
            .from('player_creatures')
            .select('*, creatures(*)')
            .eq('id', myCreatureId)
            .single()

        if (myPCResult.error || !myPCResult.data) {
            return new Response(
                JSON.stringify({ error: 'Could not fetch player creature data' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const myPC = myPCResult.data
        const myCreature = myPC.creatures as { type: string }

        // Fetch opponent stats — from creatures directly for CPU, from player_creatures for PVP
        let oppType: string
        let oppAttack: number
        let oppDefence: number
        let oppCreatureId: number // for CPU moves lookup

        if (session.is_cpu) {
            if (!session.cpu_creature_id) {
                return new Response(
                    JSON.stringify({ error: 'cpu_creature_id missing from session' }),
                    { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
                )
            }
            const { data: cpuC, error: cpuCErr } = await supabase
                .from('creatures')
                .select('id, type, base_attack, base_defence')
                .eq('id', session.cpu_creature_id)
                .single()

            if (cpuCErr || !cpuC) {
                return new Response(
                    JSON.stringify({ error: 'Could not fetch CPU creature data' }),
                    { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
                )
            }
            oppType = cpuC.type ?? 'fire'
            oppAttack = cpuC.base_attack ?? 1
            oppDefence = cpuC.base_defence ?? 1
            oppCreatureId = cpuC.id
        } else {
            const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id
            if (!opponentCreatureId) {
                return new Response(
                    JSON.stringify({ error: 'Opponent creature ID missing' }),
                    { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
                )
            }
            const { data: oppPC, error: oppPCErr } = await supabase
                .from('player_creatures')
                .select('*, creatures(*)')
                .eq('id', opponentCreatureId)
                .single()

            if (oppPCErr || !oppPC) {
                return new Response(
                    JSON.stringify({ error: 'Could not fetch opponent creature data' }),
                    { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
                )
            }
            const oppCreature = oppPC.creatures as { type: string }
            oppType = oppCreature.type
            oppAttack = oppPC.attack ?? 1
            oppDefence = oppPC.defence ?? 1
            oppCreatureId = oppPC.creature_id
        }

        // Fetch player's chosen move
        const { data: move, error: moveErr } = await supabase
            .from('moves')
            .select('*')
            .eq('id', moveId)
            .single()

        if (moveErr || !move) {
            return new Response(
                JSON.stringify({ error: 'Move not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Read modifiers — consumed on use
        const myAttackMod: number = (isPlayer1 ? battleState.player1_attack_modifier : battleState.player2_attack_modifier) ?? 0
        const myDefenceMod: number = (isPlayer1 ? battleState.player1_defence_modifier : battleState.player2_defence_modifier) ?? 0
        const oppDefenceMod: number = (isPlayer1 ? battleState.player2_defence_modifier : battleState.player1_defence_modifier) ?? 0

        // --- Player's attack ---
        const playerDamage = calculateDamage(
            move.power ?? 0,
            (myPC.attack ?? 1) + myAttackMod,
            oppDefence + oppDefenceMod,
            myCreature.type,
            oppType
        )

        const currentMyHp = (isPlayer1 ? battleState.player1_hp : battleState.player2_hp) ?? 0
        const currentOppHp = (isPlayer1 ? battleState.player2_hp : battleState.player1_hp) ?? 0
        const newOppHp = Math.max(0, currentOppHp - playerDamage)

        const descriptions: string[] = [
            buildDescription(move.name, playerDamage, myCreature.type, oppType)
        ]

        let finalMyHp = currentMyHp
        let finalOppHp = newOppHp
        let isFinished = newOppHp <= 0
        let winnerId: string | null = isFinished ? playerId : null

        // --- CPU counter-attack (same call, if CPU battle and player didn't just win) ---
        if (session.is_cpu && !isFinished) {
            const { data: cpuMoves } = await supabase
                .from('creature_moves')
                .select('move_id')
                .eq('creature_id', oppCreatureId)

            if (cpuMoves && cpuMoves.length > 0) {
                const randomMoveId = cpuMoves[Math.floor(Math.random() * cpuMoves.length)].move_id
                const { data: cpuMove } = await supabase
                    .from('moves')
                    .select('*')
                    .eq('id', randomMoveId)
                    .single()

                if (cpuMove) {
                    const cpuDamage = calculateDamage(
                        cpuMove.power ?? 0,
                        oppAttack,
                        (myPC.defence ?? 1) + myDefenceMod,
                        oppType,
                        myCreature.type
                    )
                    finalMyHp = Math.max(0, finalMyHp - cpuDamage)
                    isFinished = finalMyHp <= 0
                    descriptions.push(buildDescription(cpuMove.name, cpuDamage, oppType, myCreature.type, "CPU's "))
                    if (isFinished) winnerId = null
                }
            }
        }

        const newPlayer1Hp = isPlayer1 ? finalMyHp : finalOppHp
        const newPlayer2Hp = isPlayer1 ? finalOppHp : finalMyHp

        // Update battle state — modifiers persist for the whole battle, no clearing needed
        const { error: updateStateErr } = await supabase
            .from('battle_state')
            .update({
                player1_hp: newPlayer1Hp,
                player2_hp: newPlayer2Hp,
                turn_number: (battleState.turn_number ?? 0) + 1,
                last_move_description: descriptions.join('\n'),
                is_finished: isFinished,
            })
            .eq('session_id', sessionId)

        if (updateStateErr) {
            return new Response(
                JSON.stringify({ error: 'Failed to update battle state' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        if (isFinished) {
            await supabase
                .from('game_sessions')
                .update({ status: 'finished', winner_id: winnerId })
                .eq('id', sessionId)

            await supabase.rpc('increment_player_stats', {
                p_player_id: playerId,
                p_wins: winnerId === playerId ? 1 : 0,
                p_battles: 1,
            })

            // PVP only: also record the loser's stats
            if (!session.is_cpu) {
                const loserId = isPlayer1 ? session.player2_id : session.player1_id
                if (loserId) {
                    await supabase.rpc('increment_player_stats', {
                        p_player_id: loserId,
                        p_wins: 0,
                        p_battles: 1,
                    })
                }
            }
        } else if (!session.is_cpu) {
            // PVP only: swap turns
            const nextTurn = isPlayer1 ? session.player2_id : session.player1_id
            await supabase
                .from('game_sessions')
                .update({ current_turn: nextTurn })
                .eq('id', sessionId)
        }
        // CPU: no turn update — player always goes next

        return new Response(
            JSON.stringify({ descriptions, newPlayer1Hp, newPlayer2Hp, isFinished, winnerId }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }
})
