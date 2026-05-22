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
        if (!authHeader) {
            return errorResponse('Missing Authorization header', 401)
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userErr } = await adminClient.auth.getUser(token)
        if (userErr || !user) {
            return errorResponse('Invalid or expired token', 401)
        }

        const { sessionId } = await req.json()
        if (!sessionId) {
            return errorResponse('Missing sessionId', 400)
        }

        const { data: session, error: sessionErr } = await adminClient
            .from('game_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionErr || !session) {
            return errorResponse('Session not found', 404)
        }

        if (session.status === 'finished') {
            return errorResponse('Session already finished', 409)
        }

        const isPlayer1 = session.player1_id === user.id
        const isPlayer2 = session.player2_id === user.id
        if (!isPlayer1 && !isPlayer2) {
            return errorResponse('Not a participant in this session', 403)
        }

        const opponentId = isPlayer1 ? session.player2_id : session.player1_id
        const winnerId = session.is_cpu ? null : opponentId

        const { error: finishErr } = await adminClient
            .from('game_sessions')
            .update({ status: 'finished', winner_id: winnerId })
            .eq('id', sessionId)

        if (finishErr) {
            return errorResponse('Failed to finish session', 500)
        }

        const { data: config } = await adminClient
            .from('game_config')
            .select('credits_forfeit, credits_pvp_win')
            .single()

        await adminClient.rpc('increment_player_stats', {
            p_player_id: user.id,
            p_wins: 0,
            p_battles: 1,
            p_forfeits: 1,
            p_credits: -(config?.credits_forfeit ?? 50),
        })

        if (!session.is_cpu && opponentId) {
            await adminClient.rpc('increment_player_stats', {
                p_player_id: opponentId,
                p_wins: 1,
                p_battles: 1,
                p_credits: config?.credits_pvp_win ?? 100,
            })
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
    } catch (err) {
        console.error('Unhandled error:', err)
        return errorResponse('Internal server error', 500)
    }
})
