import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextDef'

interface ApiError {
    message: string
    code?: string
    status?: number
}

type Profile = Database['public']['Tables']['profiles']['Row']

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        async function fetchProfile(userId: string): Promise<void> {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                const apiError: ApiError = {
                    message: error.message,
                    code: error.code
                }
                console.error('Error fetching profile:', apiError)
                setProfile(null)
            } else {
                setProfile(data)
            }
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    setLoading(true)
                    try {
                        await fetchProfile(session.user.id)
                    } finally {
                        setLoading(false)
                    }
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => authListener.subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}