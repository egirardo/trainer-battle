import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

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
        if (!authHeader) return errorResponse('Missing Authorization header', 401)

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userErr } = await adminClient.auth.getUser(token)
        if (userErr || !user) return errorResponse('Invalid or expired token', 401)

        const rawBody = await req.text()
        let body: { sessionId?: unknown }
        try {
            body = JSON.parse(rawBody)
        } catch {
            return errorResponse('Invalid request body', 400)
        }
        const { sessionId } = body
        if (!sessionId) return errorResponse('Missing sessionId', 400)

        const { data: session, error: sessionErr } = await adminClient
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionErr || !session) return errorResponse('Session not found', 404)

        if (session.player1_id !== user.id && session.player2_id !== user.id) {
            return errorResponse('You are not a participant in this session', 403)
        }

        if (session.status === 'finished') return errorResponse('Session already finished', 409)
        if (session.current_turn !== user.id) return errorResponse('Not your turn', 403)

        const { data: battleState, error: battleStateErr } = await adminClient
            .from('battle_state')
            .select('is_finished')
            .eq('session_id', sessionId)
            .single()

        if (battleStateErr || !battleState) return errorResponse('Battle state not found', 404)
        if (battleState.is_finished) return errorResponse('Battle is already finished', 409)

        const isPlayer1 = session.player1_id === user.id
        const opponentId = isPlayer1 ? session.player2_id : session.player1_id
        if (!opponentId) return errorResponse('No opponent found', 400)

        const { data: profile } = await adminClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()

        const message = `${profile?.username ?? 'Player'} ran out of time!`

        const { data: updatedState, error: stateErr } = await adminClient
            .from('battle_state')
            .update({ last_move_description: message })
            .eq('session_id', sessionId)
            .eq('is_finished', false)
            .select('session_id')

        if (stateErr) return errorResponse('Failed to update battle state', 500)
        if (!updatedState || updatedState.length === 0) return errorResponse('Turn already resolved', 409)

        const { data: updatedSession, error: turnErr } = await adminClient
            .from('game_sessions')
            .update({ current_turn: opponentId })
            .eq('id', sessionId)
            .eq('current_turn', user.id)
            .eq('status', 'active')
            .select('id')

        if (turnErr) return errorResponse('Failed to hand off turn', 500)
        if (!updatedSession || updatedSession.length === 0) return errorResponse('Turn already resolved', 409)

        return new Response(
            JSON.stringify({ message }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    } catch (err) {
        console.error(err)
        return errorResponse('Internal server error', 500)
    }
})
