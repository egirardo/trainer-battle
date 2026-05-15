import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/routes'
import { useState } from 'react'

export default function ProfileConfirmation() {
    const { trainerName, trainerGender, selectedCreature } = useTrainerCreation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [error , setError] = useState<string | null>(null)


    async function handleSubmit(): Promise<void> {
        if (!user || !selectedCreature) return
        
        setSaving(true)
        setError(null)

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: trainerName,
                trainer_gender: trainerGender,
            })
            .eq('id', user.id)

        if (profileError) {
            setError('Failed to save profile information. Please try again.')
            setSaving(false)
            return
        }

        // Save selected creature
        const { error: creatureError } = await supabase
            .from('player_creatures')
            .upsert(
                {
                    player_id: user.id,
                    creature_id: selectedCreature.id,
                    level: 1,
                    experience: 0,
                    current_hp: selectedCreature.base_hp,
                    attack: selectedCreature.base_attack,
                    defence: selectedCreature.base_defence,
                    speed: selectedCreature.base_speed,
                },
                { onConflict: 'player_id', ignoreDuplicates: false }
            )

        if (creatureError) {
            setError('Failed to save creature selection. Please try again.')
            setSaving(false)
            return
        }

        void navigate(ROUTES.gameMenu)
    }

    return (
        <main>
            <p>Name: {trainerName}</p>
            <p>Gender: {trainerGender}</p>
            <p>Starter Creature: {selectedCreature?.name ?? 'None selected'}</p>
            {error && <p role="alert">{error}</p>}
            <button onClick={() => { void handleSubmit() }} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm & Start'}
            </button>
        </main>
    )
}
