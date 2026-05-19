import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  )
}

type CentralbankUser = {
  id: string
  name: string
}

type IdentityTokenResponse = {
  user: CentralbankUser
  expires_at: string
}

type TransactionResponse = {
  id: string
  stamp: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text()
    let body: { identity_token?: string }

    try {
      body = JSON.parse(rawBody) as { identity_token?: string }
    } catch {
      return errorResponse('Invalid request body', 400)
    }

    const { identity_token } = body

    if (!identity_token) {
      return errorResponse('Missing identity_token', 400)
    }

    // Fetch player info from Centralbank
    const identityRes = await fetch(`${CENTRALBANK_URL}/identity-tokens/${identity_token}`)

    if (!identityRes.ok) {
      if (identityRes.status === 401) {
        return errorResponse('Identity token expired or already used', 401)
      }
      return errorResponse('Failed to verify identity token', 502)
    }

    const identityData = await identityRes.json() as IdentityTokenResponse
    const centralbankUuid = identityData.user.id
    const playerName = identityData.user.name

    // Check if returning player
    const { data: existingProfile, error: playerError } = await adminClient
    .from('profiles')
    .select('id, username, centralbank_uuid')
    .eq('centralbank_uuid', centralbankUuid)
    .single()

    let isReturning = false
    if (playerError) {
      if (playerError.code !== 'PGRST116') {
        console.error('Failed to look up profile', playerError)
        return errorResponse('Failed to look up profile', 500)
      }
    } else {
      isReturning = existingProfile !== null
    }

    const entryFee = isReturning ? 1.50 : 3.00
    const startingCredits = isReturning ? 50 : 100
    
    // POST /transactions to Centralbank - consumes the token
    const transactionRes = await fetch(`${CENTRALBANK_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identity_token,
            amount: entryFee,
            api_key: CENTRALBANK_API_KEY,
        })
    })

    if (!transactionRes.ok) {
      if (transactionRes.status === 401) {
        return errorResponse('Identity token expired or already used', 401)
      }
      return errorResponse('Failed to process transaction', 502)
    }

    const transactionData = await transactionRes.json() as TransactionResponse
    const transactionId = transactionData.id
    const stamp = transactionData.stamp

    // Create or update supabase user
    let supabaseUserId: string

    if (isReturning && existingProfile) {
      supabaseUserId = existingProfile.id

      // Update credits and transaction ID for returning player
      await adminClient
        .from('player_stats')
        .update({
          credits: startingCredits,
          transaction_id: transactionId,
        })
        .eq('player_id', supabaseUserId)
    } else {
      // Create new Supabase auth user
      const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
        email: `${centralbankUuid}@centralbank.tivoli`,
        password: crypto.randomUUID(),
        email_confirm: true,
      })

      if (createUserError || !newUser.user) {
        return errorResponse('Failed to create user account', 500)
      }

      supabaseUserId = newUser.user.id

      // Create profile
      await adminClient
        .from('profiles')
        .insert({
          id: supabaseUserId,
          username: playerName,
          centralbank_uuid: centralbankUuid,
        })

      // Create player stats
      await adminClient
        .from('player_stats')
        .insert({
          player_id: supabaseUserId,
          credits: startingCredits,
          transaction_id: transactionId,
        })
    }

    // Create a supabase session for the user
    const { data: sessionData, error: sessionErr } = await adminClient.auth.admin.createSession({
      user_id: supabaseUserId,
    })

    if (sessionErr || !sessionData) {
      return errorResponse('Failed to create session', 500)
    }

    return new Response(
        JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        is_returning: isReturning,
        player_name: playerName,
        starting_credits: startingCredits,
        stamp,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (err) {
      console.error(err)
      return errorResponse('Internal server error', 500)
  }
})