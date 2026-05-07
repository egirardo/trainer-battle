import React from 'react'
import { TrainerCreationContext } from './trainerCreationContextDef'
import type { TrainerGender } from './trainerCreationContextDef'

export function TrainerCreationProvider({ children }: { children: React.ReactNode }) {
    const [trainerName, setTrainerName] = React.useState('')
    const [trainerNameError, setTrainerNameError] = React.useState<string | undefined>(undefined)
    const [trainerGender, setTrainerGender] = React.useState<TrainerGender>('female')
    const [selectedCreature, setSelectedCreature] = React.useState<string | null>(null)

    return (
        <TrainerCreationContext.Provider value={{ trainerName, setTrainerName, trainerNameError, setTrainerNameError, trainerGender, setTrainerGender, selectedCreature, setSelectedCreature }}>
            {children}
        </TrainerCreationContext.Provider>
    )
}
