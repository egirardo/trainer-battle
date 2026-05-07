import React from 'react'
import { TrainerCreationContext } from './trainerCreationContextDef'
import type { TrainerGender } from './trainerCreationContextDef'
import type { Creature } from '@/models/models'

export function TrainerCreationProvider({ children }: { children: React.ReactNode }) {
    const [trainerName, setTrainerName] = React.useState('')
    const [trainerNameError, setTrainerNameError] = React.useState<string | undefined>(undefined)
    const [trainerGender, setTrainerGender] = React.useState<TrainerGender>('female')
    const [selectedCreature, setSelectedCreature] = React.useState<Creature | null>(null)
    const [creatureError, setCreatureError] = React.useState<string | undefined>(undefined)

    return (
        <TrainerCreationContext.Provider value={{ trainerName, setTrainerName, trainerNameError, setTrainerNameError, trainerGender, setTrainerGender, selectedCreature, setSelectedCreature, creatureError, setCreatureError }}>
            {children}
        </TrainerCreationContext.Provider>
    )
}
