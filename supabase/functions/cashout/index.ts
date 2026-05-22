import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const CENTRALBANK_URL = Deno.env.get('CENTRALBANK_URL')!
const CENTRALBANK_API_KEY = Deno.env.get('CENTRALBANK_API_KEY')!

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

    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('centralbank_uuid')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr && profileErr.code !== 'PGRST116') {
      return errorResponse('Failed to load player profile', 500)
    }

    if (!profile?.centralbank_uuid) {
      return errorResponse('Centralbank account not linked', 403)
    }

    const { data: stats, error: statsErr } = await adminClient
      .from('player_stats')
      .select('credits, transaction_id, starting_credits')
      .eq('player_id', user.id)
      .maybeSingle()

    if (statsErr || !stats) {
      return errorResponse('Player stats not found', 404)
    }

    if (!stats.transaction_id) {
      return errorResponse('No active transaction found', 400)
    }

    const { data: config } = await adminClient
      .from('game_config')
      .select('credit_exchange_rate, payout_rounding')
      .single()

    const exchangeRate = config?.credit_exchange_rate ?? 0.03
    const rounding = config?.payout_rounding ?? 0.50

    const winnings = stats.credits - stats.starting_credits

    if (winnings <= 0) {
      return errorResponse('No payout available', 400)
    }

    const raw = winnings * exchangeRate
    const payout = Math.floor(raw / rounding) * rounding

    if (payout <= 0) {
      return errorResponse('No payout available', 400)
    }

    // POST /transactions/{id}/payout to Centralbank
    const payoutRes = await fetch(`${CENTRALBANK_URL}/transactions/${stats.transaction_id}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: payout,
        api_key: CENTRALBANK_API_KEY,
      })
    })

    if (!payoutRes.ok) {
      if (payoutRes.status === 401) {
        return errorResponse('Invalid API key', 401)
      }
      if (payoutRes.status === 404) {
        return errorResponse('Transaction not found', 404)
      }
      if (payoutRes.status === 409) {
        return errorResponse('Transaction already paid out', 409)
      }
      return errorResponse('Failed to process payout', 502)
    }

    // Clear transaction ID and reset credits
    const { error: updateErr } = await adminClient
      .from('player_stats')
      .update({ 
        credits: 0, 
        transaction_id: null 
      })
      .eq('player_id', user.id)

    if (updateErr) {
      return errorResponse('Failed to update player stats', 500)
    }

    return new Response(
      JSON.stringify({ payout }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (err) {
    console.error(err)
    return errorResponse('Internal server error', 500)
  }
})