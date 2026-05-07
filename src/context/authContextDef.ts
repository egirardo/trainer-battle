import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)
