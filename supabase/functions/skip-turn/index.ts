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

        const { sessionId } = await req.json()
        if (!sessionId) return errorResponse('Missing sessionId', 400)

        const { data: session, error: sessionErr } = await adminClient
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionErr || !session) return errorResponse('Session not found', 404)
        if (session.status === 'finished') return errorResponse('Session already finished', 409)
        if (session.current_turn !== user.id) return errorResponse('Not your turn', 403)

        const isPlayer1 = session.player1_id === user.id
        const opponentId = isPlayer1 ? session.player2_id : session.player1_id
        if (!opponentId) return errorResponse('No opponent found', 400)

        const { data: profile } = await adminClient
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()

        const message = `${profile?.username ?? 'Player'} ran out of time!`

        const { error: stateErr } = await adminClient
            .from('battle_state')
            .update({ last_move_description: message })
            .eq('session_id', sessionId)

        if (stateErr) return errorResponse('Failed to update battle state', 500)

        const { error: turnErr } = await adminClient
            .from('game_sessions')
            .update({ current_turn: opponentId })
            .eq('id', sessionId)

        if (turnErr) return errorResponse('Failed to hand off turn', 500)

        return new Response(
            JSON.stringify({ message }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    } catch (err) {
        console.error(err)
        return errorResponse('Internal server error', 500)
    }
})
