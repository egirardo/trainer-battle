import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface CachedProfile {
    id: string;
    username: string | null;
    is_admin: boolean;
}

export interface AuthContextType {
    user: User | null
    profile: CachedProfile | null | undefined
    loading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)
