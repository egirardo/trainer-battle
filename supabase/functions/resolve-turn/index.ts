import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
console.log('SERVICE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

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
    const randomFactor = 0.85 + Math.random() *0.15
    return Math.max(1, Math.floor(base * multiplier * randomFactor))
}

Deno.serve(async (req) => {
    console.log('Function called:', req.method)

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const rawBody = await req.text()
        console.log('Request body:', rawBody)

        const { sessionId, playerId, moveId } = JSON.parse(rawBody)
        console.log('Parsed body:', { sessionId, playerId, moveId })


        if (!sessionId || !playerId || !moveId) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Fetch game session
        console.log('Fetching game session...')
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
        console.log('Fetching battle state...')
        const { data: battleState, error: stateErr } = await supabase
            .from('battle_state')
            .select('*')
            .eq('session_id', sessionId)
            .single()

        console.log('Battle state result:', JSON.stringify(battleState), 'Error:', JSON.stringify(stateErr))

        if (stateErr || !battleState) {
            return new Response(
                JSON.stringify({ error: 'Battle state not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Determine current player and opponent
        const isPlayer1 = session.player1_id === playerId
        const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id
        const opponentCreatureId = (isPlayer1 ? session.player2_creature_id : session.player1_creature_id) ?? myCreatureId

        if (!myCreatureId || !opponentCreatureId) {
            return errorResponse('Creature IDs missing from session', 400)
        }

        // Fetch both creatures with base stats
        console.log('Fetching player creature...')
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
                .single()

        ])

        console.log('Player creature result:', JSON.stringify(myPCResult), 'Opponent creature result:', JSON.stringify(oppPCResult))


        if (myPCResult.error || oppPCResult.error) {
            return new Response(
                JSON.stringify({ error: 'Could not fetch creature data' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        const myPC = myPCResult.data
        const oppPC = oppPCResult.data
        const myCreature = myPC.creatures as { type: string }
        const oppCreature = oppPC.creatures as { type: string }

        // Fetch move being used
        const { data: move, error: moveErr } = await supabase
            .from('moves')
            .select('*')
            .eq('id', moveId)
            .single()

        console.log('Move result:', JSON.stringify(move), 'Error:', JSON.stringify(moveErr))

        if (moveErr || !move) {
            return new Response(
                JSON.stringify({ error: 'Move not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        // Calculate damage
        const damage = calculateDamage(
            move.power ?? 0,
            myPC.attack ?? 1,
            oppPC.defence ?? 1,
            myCreature.type,
            oppCreature.type
        )

        // Update HP
        const currentMyHp = isPlayer1 ? battleState.player1_hp : battleState.player2_hp
        const currentOppHp = isPlayer1 ? battleState.player2_hp : battleState.player1_hp
        const newOppHp = Math.max(0, (currentOppHp ?? 0) - damage)
        const isFinished = newOppHp <= 0

        const newPlayer1Hp = isPlayer1 ? currentMyHp : newOppHp
        const newPlayer2Hp = isPlayer1 ? newOppHp : currentMyHp

        // Determine next turn
        const nextTurn = isPlayer1 ? session.player2_id : session.player1_id

        // Build move description
        const multiplier = getTypeMultiplier(myCreature.type, oppCreature.type)
        const effectiveness = multiplier > 1 ? " It's super effective!" : multiplier < 1 ? " It's not very effective..." : ""
        const description = `${move.name} dealt ${damage} damage!${effectiveness}`

        // Update battle state
        const { error: updateStateErr } = await supabase
            .from('battle_state')
            .update({
                player1_hp: newPlayer1Hp,
                player2_hp: newPlayer2Hp,
                turn_number: (battleState.turn_number ?? 0) + 1,
                last_move_description: description,
                is_finished: isFinished,
            })
            .eq('session_id', sessionId)
        
        console.log('Update battle state result:', JSON.stringify({ newPlayer1Hp, newPlayer2Hp, description, isFinished }), 'Error:', JSON.stringify(updateStateErr))

        if (updateStateErr) {
            return new Response(
                JSON.stringify({ error: 'Failed to update battle state' }),
                { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            )
        }

        if (isFinished) {
            const winnerId = playerId
            const loserId = isPlayer1 ? session.player2_id : session.player1_id

            console.log('Winner ID:', winnerId, 'Loser ID:', loserId)

            await supabase
                .from('game_sessions')
                .update({ status: 'finished', winner_id: winnerId })
                .eq('id', sessionId)

            // Update winner stats
            await supabase.rpc('increment_player_stats', {
                p_player_id: winnerId,
                p_wins: 1,
                p_battles: 1,
            })

            // Update loser stats
            await supabase.rpc('increment_player_stats', {
                p_player_id: loserId,
                p_wins: 0,
                p_battles: 1,
            })
        } else {
            await supabase
                .from('game_sessions')
                .update({ current_turn: nextTurn })
                .eq('id', sessionId)
        }

        return new Response(
            JSON.stringify({ 
                damage,
                description,
                newPlayer1Hp,
                newPlayer2Hp,
                isFinished,
                nextTurn: isFinished ? null : nextTurn,
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
        )
    }
})