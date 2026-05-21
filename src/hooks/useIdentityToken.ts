import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/routes";
import { useAuth } from "./useAuth";

type IdentityTokenResult = {
    access_token: string
    refresh_token: string
    is_returning: boolean
    has_starter_creature: boolean
    player_name: string
    starting_credits: number
    stamp: object
}

export function useIdentityToken() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [redirectTo, setRedirectTo] = useState<string | null>(null)
    const [flowActive, setFlowActive] = useState(false)

    useEffect(() => {
        if (!redirectTo || !user) return

        void navigate(redirectTo, { replace: true })
        queueMicrotask(() => {
            setRedirectTo(null)
            setFlowActive(false)
        })
    }, [navigate, redirectTo, user])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const identityToken = params.get('identity_token')

        if (!identityToken) return

        // Strip from URL and store for re-use
        window.history.replaceState({}, '', window.location.pathname)
        sessionStorage.setItem('identity_token', identityToken)

        async function processToken() {
            setProcessing(true)
            setFlowActive(true)
            let shouldRetainFlow = false

            try {
                const { data, error } = await supabase.functions.invoke<IdentityTokenResult>('handle-identity-token', {
                    body: { identity_token: identityToken },
                })

                if (error) {
                    setError('Failed to process entry token. Please return to Tivoli.')
                    return
                }

                if (!data) {
                    setError('No data returned from server. Please return to Tivoli.')
                    return
                }

                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                })

                if (sessionError) {
                    setError('Failed to create session. Please return to Tivoli.')
                    return
                }
                shouldRetainFlow = true
                setRedirectTo(data.has_starter_creature ? ROUTES.gameMenu : ROUTES.characterSelect)

            } catch {
                setError('Something went wrong. Please return to Tivoli.')
            } finally {
                setProcessing(false)

                if (!shouldRetainFlow) {
                    setFlowActive(false)
                }
            }
        }

        void processToken()
    }, [navigate])

    return { processing, error, flowActive }
}