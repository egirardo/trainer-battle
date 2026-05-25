import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCreatureImage } from '@/lib/creatureImages'
import type { Creature, CreatureType } from '@/models/models'

interface UseCreaturesResult {
    creatures: Creature[]
    loading: boolean
    error: string | null
}

export function useCreatures(): UseCreaturesResult {
    const [creatures, setCreatures] = useState<Creature[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCreatures() {
            const { data, error } = await supabase
                .from('creatures')
                .select('id, name, type, base_hp, base_attack, base_defence, base_speed, description, image')
                .eq('is_boss', false)
                .order('id')

            if (error) {
                setError('Failed to load creatures.')
                setLoading(false)
                return
            }

            const mapped: Creature[] = (data ?? []).map(row => ({
                id: row.id,
                name: row.name ?? '',
                type: (row.type as CreatureType) ?? 'fire',
                base_hp: row.base_hp ?? 0,
                base_attack: row.base_attack ?? 0,
                base_defence: row.base_defence ?? 0,
                base_speed: row.base_speed ?? 0,
                description: row.description ?? '',
                image: getCreatureImage(row.image ?? ''),
            }))

            setCreatures(mapped)
            setLoading(false)
        }

        void fetchCreatures()
    }, [])

    return { creatures, loading, error }
}
