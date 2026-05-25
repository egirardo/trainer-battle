import React from 'react'
import { TrainerCreationContext, TRAINER_CREATION_SESSION_KEY } from './trainerCreationContextDef'
import type { TrainerGender } from './trainerCreationContextDef'
import type { Creature } from '@/models/models'

interface PersistedState {
    trainerName: string
    trainerGender: TrainerGender
    selectedCreature: Creature | null
}

const DEFAULTS: PersistedState = {
    trainerName: '',
    trainerGender: 'female',
    selectedCreature: null,
}

function loadFromSession(): PersistedState {
    try {
        const raw = sessionStorage.getItem(TRAINER_CREATION_SESSION_KEY)
        if (!raw) return DEFAULTS
        return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<PersistedState>) }
    } catch {
        return DEFAULTS
    }
}

export function TrainerCreationProvider({ children }: { children: React.ReactNode }) {
    const initial = loadFromSession()

    const [trainerName, setTrainerName] = React.useState(initial.trainerName)
    const [trainerNameError, setTrainerNameError] = React.useState<string | undefined>(undefined)
    const [trainerGender, setTrainerGender] = React.useState<TrainerGender>(initial.trainerGender)
    const [selectedCreature, setSelectedCreature] = React.useState<Creature | null>(initial.selectedCreature)
    const [creatureError, setCreatureError] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        try {
            const state: PersistedState = { trainerName, trainerGender, selectedCreature }
            sessionStorage.setItem(TRAINER_CREATION_SESSION_KEY, JSON.stringify(state))
        } catch {
            // Storage unavailable or quota exceeded — creation flow continues without persistence
        }
    }, [trainerName, trainerGender, selectedCreature])

    return (
        <TrainerCreationContext.Provider value={{
            trainerName, setTrainerName,
            trainerNameError, setTrainerNameError,
            trainerGender, setTrainerGender,
            selectedCreature, setSelectedCreature,
            creatureError, setCreatureError,
        }}>
            {children}
        </TrainerCreationContext.Provider>
    )
}
