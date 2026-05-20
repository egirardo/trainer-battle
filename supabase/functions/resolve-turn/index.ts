import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const adminClient = createClient(
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

function errorResponse(message: string, status: number): Response {
    return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return errorResponse('Missing Authorization header', 401)
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userErr } = await adminClient.auth.getUser(token)
        if (userErr || !user) {
            return errorResponse('Invalid or expired token', 401)
        }

        const userId = user.id

        const rawBody = await req.text()
        let body: { sessionId?: unknown; playerId?: unknown; moveId?: unknown }
        try {
            body = JSON.parse(rawBody)
        } catch {
            return errorResponse('Invalid request body', 400)
        }
        const { sessionId, playerId, moveId } = body

        if (sessionId == null || playerId == null || moveId == null) {
            return errorResponse('Missing required parameters', 400)
        }

        // Verify caller matches the playerId they sent
        if (userId !== playerId) {
            return errorResponse('Player ID does not match token user', 403)
        }

        // Fetch session
        const { data: session, error: sessionErr } = await adminClient
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionErr || !session) {
            return errorResponse('Game session not found', 404)
        }

        // Verify caller is actually a participant in this session
        if (session.player1_id !== userId && session.player2_id !== userId) {
            return errorResponse('You are not a participant in this session', 403)
        }

        // Reject already finished sessions
        if (session.status === 'finished') {
            return errorResponse('Battle is already finished', 400)
        }

        // Enforce turn order for PVP
        if (!session.is_cpu && session.current_turn !== userId) {
            return errorResponse('It is not your turn', 403)
        }

        // Fetch battle state
        const { data: battleState, error: stateErr } = await adminClient
            .from('battle_state')
            .select('*')
            .eq('session_id', sessionId)
            .single()

        if (stateErr || !battleState) {
            return errorResponse('Battle state not found', 404)
        }

        // Reject already finished battle state
        if (battleState.is_finished) {
            return errorResponse('Battle is already finished', 400)
        }

        const isPlayer1 = session.player1_id === playerId
        const myCreatureId = isPlayer1 ? session.player1_creature_id : session.player2_creature_id

        if (!myCreatureId) {
            return errorResponse('Player creature ID missing', 400)
        }

        // Fetch player's creature
        const myPCResult = await adminClient
            .from('player_creatures')
            .select('*, creatures(*)')
            .eq('id', myCreatureId)
            .single()

        if (myPCResult.error || !myPCResult.data) {
            return errorResponse('Could not fetch player creature data', 500)
        }

        const myPC = myPCResult.data
        const myCreature = myPC.creatures as { type: string }

        const { data: myProfile } = await adminClient
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single()
        const playerPrefix = `${myProfile?.username ?? 'You'}: `

        // Validate move belongs to player's creature
        const { data: validMove, error: validMoveErr } = await adminClient
            .from('creature_moves')
            .select('move_id')
            .eq('creature_id', myPC.creature_id)
            .eq('move_id', moveId)
            .single()

        if (validMoveErr || !validMove) {
            return errorResponse('Move does not belong to your creature', 403)
        }

        // Fetch opponent stats
        let oppType: string
        let oppAttack: number
        let oppDefence: number
        let oppCreatureId: number

        if (session.is_cpu) {
            if (!session.cpu_creature_id) {
                return errorResponse('cpu_creature_id missing from session', 400)
            }
            const { data: cpuC, error: cpuCErr } = await adminClient
                .from('creatures')
                .select('id, type, base_attack, base_defence')
                .eq('id', session.cpu_creature_id)
                .single()

            if (cpuCErr || !cpuC) {
                return errorResponse('Could not fetch CPU creature data', 500)
            }
            oppType = cpuC.type ?? 'fire'
            oppAttack = cpuC.base_attack ?? 1
            oppDefence = cpuC.base_defence ?? 1
            oppCreatureId = cpuC.id
        } else {
            const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id
            if (!opponentCreatureId) {
                return errorResponse('Opponent creature ID missing', 400)
            }
            const { data: oppPC, error: oppPCErr } = await adminClient
                .from('player_creatures')
                .select('*, creatures(*)')
                .eq('id', opponentCreatureId)
                .single()

            if (oppPCErr || !oppPC) {
                return errorResponse('Could not fetch opponent creature data', 500)
            }
            const oppCreature = oppPC.creatures as { type: string }
            oppType = oppCreature.type
            oppAttack = oppPC.attack ?? 1
            oppDefence = oppPC.defence ?? 1
            oppCreatureId = oppPC.creature_id
        }

        // Fetch move
        const { data: move, error: moveErr } = await adminClient
            .from('moves')
            .select('*')
            .eq('id', moveId)
            .single()

        if (moveErr || !move) {
            return errorResponse('Move not found', 404)
        }

        // Read stat modifiers
        const myAttackMod: number = (isPlayer1 ? battleState.player1_attack_modifier : battleState.player2_attack_modifier) ?? 0
        const myDefenceMod: number = (isPlayer1 ? battleState.player1_defence_modifier : battleState.player2_defence_modifier) ?? 0
        const oppDefenceMod: number = (isPlayer1 ? battleState.player2_defence_modifier : battleState.player1_defence_modifier) ?? 0

        // Player's attack
        const playerDamage = calculateDamage(
            move.power ?? 0,
            (myPC.attack ?? 1) + myAttackMod,
            oppDefence + oppDefenceMod,
            myCreature.type,
            oppType
        )

        const currentMyHp = isPlayer1 ? battleState.player1_hp ?? 0 : battleState.player2_hp ?? 0
        const currentOppHp = isPlayer1 ? battleState.player2_hp ?? 0 : battleState.player1_hp ?? 0
        const newOppHp = Math.max(0, currentOppHp - playerDamage)

        const descriptions: string[] = [
            buildDescription(move.name, playerDamage, myCreature.type, oppType, playerPrefix)
        ]

        let finalMyHp = currentMyHp
        let finalOppHp = newOppHp
        let isFinished = newOppHp <= 0
        let winnerId: string | null = isFinished ? playerId : null

        // CPU counter-attack
        if (session.is_cpu && !isFinished) {
            const { data: cpuMoves, error: cpuMovesErr } = await adminClient
                .from('creature_moves')
                .select('move_id')
                .eq('creature_id', oppCreatureId)

            if (cpuMovesErr) {
                return errorResponse('Could not fetch CPU moves', 500)
            }

            if (cpuMoves && cpuMoves.length > 0) {
                const randomMoveId = cpuMoves[Math.floor(Math.random() * cpuMoves.length)].move_id
                const { data: cpuMove, error: cpuMoveErr } = await adminClient
                    .from('moves')
                    .select('*')
                    .eq('id', randomMoveId)
                    .single()

                if (cpuMoveErr || !cpuMove) {
                    return errorResponse('Could not fetch CPU move', 500)
                }

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

        const newPlayer1Hp = isPlayer1 ? finalMyHp : finalOppHp
        const newPlayer2Hp = isPlayer1 ? finalOppHp : finalMyHp

        // Update battle state — optimistic lock on turn_number prevents double-submission
        const { data: updatedState, error: updateStateErr } = await adminClient
            .from('battle_state')
            .update({
                player1_hp: newPlayer1Hp,
                player2_hp: newPlayer2Hp,
                turn_number: (battleState.turn_number ?? 0) + 1,
                last_move_description: descriptions.join('\n'),
                is_finished: isFinished,
            })
            .eq('session_id', sessionId)
            .eq('turn_number', battleState.turn_number)
            .select('session_id')

        if (updateStateErr) {
            return errorResponse('Failed to update battle state', 500)
        }
        if (!updatedState || updatedState.length === 0) {
            return errorResponse('Turn already submitted', 409)
        }

        if (isFinished) {
            const { error: finishErr } = await adminClient
                .from('game_sessions')
                .update({ status: 'finished', winner_id: winnerId })
                .eq('id', sessionId)

            if (finishErr) {
                console.error('Partial state: battle_state finished but session not closed', finishErr)
                return errorResponse('Failed to finish session', 500)
            }

            const { error: winnerStatsErr } = await adminClient.rpc('increment_player_stats', {
                p_player_id: playerId,
                p_wins: winnerId === playerId ? 1 : 0,
                p_battles: 1,
            })

            if (winnerStatsErr) {
                console.error('Partial state: session closed but winner stats not updated', winnerStatsErr)
                return errorResponse('Failed to update winner stats', 500)
            }

            if (!session.is_cpu) {
                const loserId = isPlayer1 ? session.player2_id : session.player1_id
                if (loserId) {
                    const { error: loserStatsErr } = await adminClient.rpc('increment_player_stats', {
                        p_player_id: loserId,
                        p_wins: 0,
                        p_battles: 1,
                    })

                    if (loserStatsErr) {
                        console.error('Partial state: winner stats updated but loser stats not updated', loserStatsErr)
                        return errorResponse('Failed to update loser stats', 500)
                    }
                }
            }
        } else if (!session.is_cpu) {
            const nextTurn = isPlayer1 ? session.player2_id : session.player1_id
            const { error: updateTurnErr } = await adminClient
                .from('game_sessions')
                .update({ current_turn: nextTurn })
                .eq('id', sessionId)

            if (updateTurnErr) {
                console.error('Partial state: battle_state updated but turn not handed off', updateTurnErr)
                return errorResponse('Failed to hand off turn', 500)
            }
        }

        return new Response(
            JSON.stringify({ descriptions, newPlayer1Hp, newPlayer2Hp, isFinished, winnerId }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )

    } catch (err) {
        console.error(err)
        return errorResponse('Internal server error', 500)
    }
})