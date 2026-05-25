import { createClient } from 'jsr:@supabase/supabase-js@2'

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

type CentralbankUser = {
  id: string | number
  name: string
}

type IdentityTokenResponse = {
  user: CentralbankUser
  expires_at: string
}

type TransactionResponse = {
  transaction_id: number
  amount: number
  stamp: {
    animal: string
    metal: string | null
    image_url: string
  } | null
}

async function cleanupCreatedAccount(userId: string): Promise<void> {
  await adminClient.from('player_stats').delete().eq('player_id', userId)
  await adminClient.from('profiles').delete().eq('id', userId)
  await adminClient.auth.admin.deleteUser(userId)
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
    
    const centralbankUuid = String(identityData.user.id)
    const playerName = identityData.user.name

    // Check if returning player
    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from('profiles')
      .select('id, username, centralbank_uuid')
      .eq('centralbank_uuid', centralbankUuid)
      .maybeSingle()

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      return errorResponse('Failed to look up player profile', 500)
    }

    const isReturning = existingProfile !== null

    let supabaseUserId: string
    let hasStarterCreature = false

    const userPassword = `${centralbankUuid}-${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.substring(0, 8)}`

    if (isReturning && existingProfile) {
      supabaseUserId = existingProfile.id
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(supabaseUserId, {
        password: userPassword,
      })
      
      if (updateErr) {
        return errorResponse('Failed to update user credentials', 500)
      }
      
    }

    const { data: config, error: configErr } = await adminClient
      .from('game_config')
      .select('entry_fee_new, entry_fee_returning, credits_new, credits_returning')
      .single()

    if (configErr || !config) {
        return errorResponse('Failed to load game config', 500)
    }

    const entryFee = isReturning ? config.entry_fee_returning : config.entry_fee_new
    const startingCredits = isReturning ? config.credits_returning : config.credits_new

    let newUser: { user: { id: string } } | null = null

    if (!isReturning) {
      const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
        email: `${centralbankUuid}@centralbank.tivoli`,
        password: userPassword,
        email_confirm: true,
      })

      if (createUserError || !createdUser.user) {
        return errorResponse('Failed to create user account', 500)
      }

      supabaseUserId = createdUser.user.id
      newUser = createdUser
    } else {
      supabaseUserId = existingProfile.id
    }

    console.log('entryFee:', entryFee, 'isReturning:', isReturning, 'config:', config)

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
      if (!isReturning && newUser?.user) {
        await adminClient.auth.admin.deleteUser(newUser.user.id)
      }

      if (transactionRes.status === 401) {
        return errorResponse('Identity token expired or already used', 401)
      }

      if (transactionRes.status === 402) {
        return errorResponse('Insufficient funds', 402)
      }
      return errorResponse('Failed to process transaction', 502)
    }

    let rawTransaction: unknown
    try {
      rawTransaction = await transactionRes.json() as unknown
    } catch {
      if (!isReturning && newUser?.user) {
        await adminClient.auth.admin.deleteUser(newUser.user.id)
      }
      return errorResponse('Unexpected response from Centralbank', 502)
    }

    if (
      typeof rawTransaction !== 'object' ||
      rawTransaction === null ||
      !('transaction_id' in rawTransaction) ||
      typeof (rawTransaction as Record<string, unknown>).transaction_id !== 'number'
    ) {
      if (!isReturning && newUser?.user) {
        await adminClient.auth.admin.deleteUser(newUser.user.id)
      }
      return errorResponse('Unexpected response from Centralbank', 502)
    }

    const transactionData = rawTransaction as TransactionResponse
    const transactionId = String(transactionData.transaction_id)
    const stamp = transactionData.stamp

    if (!isReturning) {
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: supabaseUserId,
          username: playerName,
          centralbank_uuid: centralbankUuid,
        }, { onConflict: 'id' })

      if (profileError) {
        await cleanupCreatedAccount(supabaseUserId)
        return errorResponse('Failed to create user profile', 500)
      }
    }
    

    const { data: existingCreature, error: existingCreatureError } = await adminClient
      .from('player_creatures')
      .select('id')
      .eq('player_id', supabaseUserId)
      .maybeSingle()

    if (existingCreatureError && existingCreatureError.code !== 'PGRST116') {
      if (!isReturning) {
        await cleanupCreatedAccount(supabaseUserId)
      }
      return errorResponse('Failed to load creature state', 500)
    }

    hasStarterCreature = existingCreature !== null

    const { error: statsError } = await adminClient
      .from('player_stats')
      .upsert({
        player_id: supabaseUserId,
        credits: startingCredits,
        transaction_id: transactionId,
        starting_credits: startingCredits,
      }, { onConflict: 'player_id' })

    if (statsError) {
      if (!isReturning) await cleanupCreatedAccount(supabaseUserId)
      return errorResponse('Failed to update player stats', 500)
    }

    const email = `${centralbankUuid}@centralbank.tivoli`

    // Create a supabase session for the user
    const { data: sessionData, error: sessionErr } = await adminClient.auth.signInWithPassword({
      email,
      password: userPassword,
    })

    if (sessionErr || !sessionData) {
      if (!isReturning) await cleanupCreatedAccount(supabaseUserId)
      return errorResponse('Failed to create session', 500)
    }

    return new Response(
        JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        is_returning: isReturning,
        has_starter_creature: hasStarterCreature,
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