import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ROUTES } from '@/routes'
import { useState } from 'react'
import ProfileConfirmationBody from '@/components/molecules/profileConfirmation/ProfileConfirmationBody'
import { clearCreationSession } from '@/context/trainerCreationContextDef'
import { capitalizeFirst } from '@/utils/trainerValidation'

export default function ProfileConfirmation() {
    const { trainerName, trainerGender, selectedCreature } = useTrainerCreation()
    const formattedName = capitalizeFirst(trainerName)
    const { user } = useAuth()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!selectedCreature) {
        return (
            <main>
                <p role="alert">No creature selected. Please go back and select a creature.</p>
            </main>
        )
    }

    async function handleSubmit(): Promise<void> {
        if (!user || !selectedCreature) return

        setSaving(true)
        setError(null)

        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username: formattedName,
                    trainer_gender: trainerGender,
                })
                .eq('id', user.id)

            if (profileError) {
                setError('Failed to save profile information. Please try again.')
                return
            }

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
                return
            }

            clearCreationSession()
            void navigate(ROUTES.gameMenu)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            <ProfileConfirmationBody
                trainerName={formattedName}
                trainerGender={trainerGender}
                creature={selectedCreature}
                onConfirm={() => { void handleSubmit() }}
                saving={saving}
                error={error}
            />
        </main>
    )
}
