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
    fire:  { fire: 1,    water: 0.75, grass: 1.5  },
    water: { fire: 1.5,  water: 1,    grass: 0.75 },
    grass: { fire: 0.75, water: 1.5,  grass: 1    },
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
        let oppSpeed = 50
        let oppCreatureId: number

        if (session.is_cpu) {
            if (!session.cpu_creature_id) {
                return errorResponse('cpu_creature_id missing from session', 400)
            }
            const [{ data: cpuC, error: cpuCErr }, { data: cpuConfig }] = await Promise.all([
                adminClient.from('creatures').select('id, type, base_attack, base_defence, base_speed').eq('id', session.cpu_creature_id).single(),
                adminClient.from('game_config').select('stat_boost_attack, stat_boost_defence, stat_boost_speed').single(),
            ])

            if (cpuCErr || !cpuC) {
                return errorResponse('Could not fetch CPU creature data', 500)
            }
            const levelsAboveBase = (myPC.level ?? 1) - 1
            oppType = cpuC.type ?? 'fire'
            oppAttack = (cpuC.base_attack ?? 1) + levelsAboveBase * (cpuConfig?.stat_boost_attack ?? 2)
            oppDefence = (cpuC.base_defence ?? 1) + levelsAboveBase * (cpuConfig?.stat_boost_defence ?? 2)
            oppSpeed = (cpuC.base_speed ?? 50) + levelsAboveBase * (cpuConfig?.stat_boost_speed ?? 1)
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

        // Fetch CPU move up front so turn order is determined before any damage is applied
        let cpuDamage = 0
        let cpuDesc = ''
        let cpuGoesFirst = false

        if (session.is_cpu) {
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

                cpuDamage = calculateDamage(
                    cpuMove.power ?? 0,
                    oppAttack,
                    (myPC.defence ?? 1) + myDefenceMod,
                    oppType,
                    myCreature.type
                )
                cpuGoesFirst = oppSpeed > (myPC.speed ?? 50)
                cpuDesc = buildDescription(cpuMove.name, cpuDamage, oppType, myCreature.type, "CPU's ")
            }
        }

        // Player's attack
        const playerDamage = calculateDamage(
            move.power ?? 0,
            (myPC.attack ?? 1) + myAttackMod,
            oppDefence + oppDefenceMod,
            myCreature.type,
            oppType
        )
        const playerDesc = buildDescription(move.name, playerDamage, myCreature.type, oppType, playerPrefix)

        const currentMyHp = isPlayer1 ? battleState.player1_hp ?? 0 : battleState.player2_hp ?? 0
        const currentOppHp = isPlayer1 ? battleState.player2_hp ?? 0 : battleState.player1_hp ?? 0

        const descriptions: string[] = []
        let finalMyHp = currentMyHp
        let finalOppHp = currentOppHp
        let isFinished = false
        let winnerId: string | null = null

        if (session.is_cpu && cpuGoesFirst && cpuDamage > 0) {
            // CPU acts first — player damage is only applied if they survive
            finalMyHp = Math.max(0, currentMyHp - cpuDamage)
            descriptions.push(cpuDesc)
            if (finalMyHp <= 0) {
                isFinished = true
            } else {
                finalOppHp = Math.max(0, currentOppHp - playerDamage)
                descriptions.push(playerDesc)
                if (finalOppHp <= 0) {
                    isFinished = true
                    winnerId = playerId
                }
            }
        } else {
            // Player acts first
            finalOppHp = Math.max(0, currentOppHp - playerDamage)
            descriptions.push(playerDesc)
            if (finalOppHp <= 0) {
                isFinished = true
                winnerId = playerId
            } else if (session.is_cpu && cpuDamage > 0) {
                finalMyHp = Math.max(0, currentMyHp - cpuDamage)
                descriptions.push(cpuDesc)
                if (finalMyHp <= 0) {
                    isFinished = true
                }
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

        let xpGained = 0
        let creditsGained = 0
        let newLevel: number | null = null
        let leveledUp = false
        let creditsGained = 0

        if (isFinished) {
            const { error: finishErr } = await adminClient
                .from('game_sessions')
                .update({ status: 'finished', winner_id: winnerId })
                .eq('id', sessionId)

            if (finishErr) {
                console.error('Partial state: battle_state finished but session not closed', finishErr)
                return errorResponse('Failed to finish session', 500)
            }

            const { data: config } = await adminClient.from('game_config').select('*').single()
            const XP_PVP_WIN = config?.xp_pvp_win ?? 100
            const XP_PVP_LOSS = config?.xp_pvp_loss ?? 50
            const XP_CPU_WIN = config?.xp_cpu_win ?? 50
            const XP_CPU_LOSS = config?.xp_cpu_loss ?? 25
            const XP_PER_LEVEL = config?.xp_per_level ?? 100

            const isWinner = winnerId === playerId
            creditsGained = session.is_cpu
                ? (isWinner ? (config?.credits_cpu_win ?? 50) : -(config?.credits_cpu_loss ?? 10))
                : (isWinner ? (config?.credits_pvp_win ?? 100) : -(config?.credits_pvp_loss ?? 25))

            const { error: winnerStatsErr } = await adminClient.rpc('increment_player_stats', {
                p_player_id: playerId,
                p_wins: isWinner ? 1 : 0,
                p_losses: isWinner ? 0 : 1,
                p_battles: 1,
                p_credits: creditsGained,
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
                        p_losses: 1,
                        p_battles: 1,
                        p_credits: -(config?.credits_pvp_loss ?? 25),
                    })
                    if (loserStatsErr) {
                        console.error('Partial state: winner stats updated but loser stats not updated', loserStatsErr)
                        return errorResponse('Failed to update loser stats', 500)
                    }
                }
            }

            // Award XP and level up creatures

            xpGained = session.is_cpu
                ? (winnerId === playerId ? XP_CPU_WIN : XP_CPU_LOSS)
                : (winnerId === playerId ? XP_PVP_WIN : XP_PVP_LOSS)

            creditsGained = session.is_cpu
                ? (winnerId === playerId ? (config?.credits_cpu_win ?? 10) : (config?.credits_cpu_loss ?? 5))
                : (winnerId === playerId ? (config?.credits_pvp_win ?? 20) : (config?.credits_pvp_loss ?? 10))

            const { data: currentStats } = await adminClient
                .from('player_stats')
                .select('credits')
                .eq('player_id', playerId)
                .single()

            if (currentStats) {
                const { error: creditsErr } = await adminClient
                    .from('player_stats')
                    .update({ credits: (currentStats.credits ?? 0) + creditsGained })
                    .eq('player_id', playerId)
                if (creditsErr) console.error('Failed to update player credits:', creditsErr)
            }

            const { data: myPCForXp } = await adminClient
                .from('player_creatures')
                .select('id, level, experience, attack, defence, speed, current_hp')
                .eq('id', myCreatureId as number)
                .single()

            if (myPCForXp) {
                const oldLevel = myPCForXp.level ?? 1
                const newExp = (myPCForXp.experience ?? 0) + xpGained
                const computedNewLevel = Math.floor(newExp / XP_PER_LEVEL) + 1
                const levelsGained = computedNewLevel - oldLevel

                newLevel = computedNewLevel
                leveledUp = levelsGained > 0

                const updateData: Record<string, number> = { experience: newExp, level: computedNewLevel }
                if (levelsGained > 0) {
                    updateData.attack = (myPCForXp.attack ?? 0) + levelsGained * (config?.stat_boost_attack ?? 2)
                    updateData.defence = (myPCForXp.defence ?? 0) + levelsGained * (config?.stat_boost_defence ?? 2)
                    updateData.speed = (myPCForXp.speed ?? 0) + levelsGained * (config?.stat_boost_speed ?? 1)
                    updateData.current_hp = (myPCForXp.current_hp ?? 0) + levelsGained * (config?.stat_boost_hp ?? 25)

                }

                const { error: xpErr } = await adminClient
                    .from('player_creatures')
                    .update(updateData)
                    .eq('id', myPCForXp.id)
                if (xpErr) console.error('Failed to update player XP:', xpErr)
            }

            if (!session.is_cpu) {
                const opponentCreatureId = isPlayer1 ? session.player2_creature_id : session.player1_creature_id
                if (opponentCreatureId) {
                    const oppXp = winnerId === playerId ? XP_PVP_LOSS : XP_PVP_WIN
                    const { data: oppPCForXp } = await adminClient
                        .from('player_creatures')
                        .select('id, level, experience, attack, defence, speed, current_hp')
                        .eq('id', opponentCreatureId as number)
                        .single()

                    if (oppPCForXp) {
                        const oldOppLevel = oppPCForXp.level ?? 1
                        const newOppExp = (oppPCForXp.experience ?? 0) + oppXp
                        const newOppLevel = Math.floor(newOppExp / XP_PER_LEVEL) + 1
                        const oppLevelsGained = newOppLevel - oldOppLevel

                        const oppUpdateData: Record<string, number> = { experience: newOppExp, level: newOppLevel }
                        if (oppLevelsGained > 0) {
                            oppUpdateData.attack = (oppPCForXp.attack ?? 0) + oppLevelsGained * 2
                            oppUpdateData.defence = (oppPCForXp.defence ?? 0) + oppLevelsGained * 2
                            oppUpdateData.speed = (oppPCForXp.speed ?? 0) + oppLevelsGained
                            oppUpdateData.current_hp = (oppPCForXp.current_hp ?? 0) + oppLevelsGained * 25
                        }

                        const { error: oppXpErr } = await adminClient
                            .from('player_creatures')
                            .update(oppUpdateData)
                            .eq('id', oppPCForXp.id)
                        if (oppXpErr) console.error('Failed to update opponent XP:', oppXpErr)
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
            JSON.stringify({ descriptions, newPlayer1Hp, newPlayer2Hp, isFinished, winnerId, xpGained, creditsEarned, newLevel, leveledUp }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )

    } catch (err) {
        console.error(err)
        return errorResponse('Internal server error', 500)
    }
})