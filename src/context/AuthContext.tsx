import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextDef'
import type { CachedProfile } from './authContextDef'


function isCachedProfile(value: unknown): value is CachedProfile {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value && typeof (value as Record<string, unknown>).id === 'string' &&
        'username' in value &&
        (
            typeof (value as Record<string, unknown>).username === 'string' ||
             (value as Record<string, unknown>).username === null
         ) &&
        'is_admin' in value && typeof (value as Record<string, unknown>).is_admin === 'boolean'
    )
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<CachedProfile | null | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)

                if (!session) {
                    sessionStorage.removeItem('profile')
                    setProfile(null)
                    setLoading(false)
                    return
                }

                setLoading(false)

                if (session.user) {
                    const cached = sessionStorage.getItem('profile')
                    if (cached) {
                        try {
                            const parsed: unknown = JSON.parse(cached)
                            if (isCachedProfile(parsed) && parsed.id === session.user.id) {
                                setProfile(parsed)
                                return
                            }
                        } catch {
                            sessionStorage.removeItem('profile')
                        }
                    }

                    const { data } = await supabase
                        .from('profiles')
                        .select('id, username, is_admin')
                        .eq('id', session.user.id)
                        .single()
                    if (data) sessionStorage.setItem('profile', JSON.stringify(data))
                    setProfile(data)
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