import React from 'react'
import { TrainerCreationContext, TRAINER_CREATION_SESSION_KEY } from './trainerCreationContextDef'
import type { TrainerGender } from './trainerCreationContextDef'
import type { Creature, CreatureType } from '@/models/models'

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

// ── Validators ──────────────────────────────────────────────────────────────

const VALID_GENDERS: TrainerGender[] = ['male', 'female', 'nb']
const VALID_TYPES: CreatureType[] = ['fire', 'water', 'grass']

function isValidCreature(value: unknown): value is Creature {
    if (typeof value !== 'object' || value === null) return false
    const c = value as Record<string, unknown>
    return (
        typeof c.id === 'number' &&
        typeof c.name === 'string' &&
        VALID_TYPES.includes(c.type as CreatureType) &&
        typeof c.base_hp === 'number' &&
        typeof c.base_attack === 'number' &&
        typeof c.base_defence === 'number' &&
        typeof c.base_speed === 'number' &&
        typeof c.description === 'string' &&
        (c.image === undefined || typeof c.image === 'string')
    )
}

// ── Session helpers ──────────────────────────────────────────────────────────

function loadFromSession(): PersistedState {
    try {
        const raw = sessionStorage.getItem(TRAINER_CREATION_SESSION_KEY)
        if (!raw) return DEFAULTS

        const parsed: unknown = JSON.parse(raw)
        if (typeof parsed !== 'object' || parsed === null) return DEFAULTS

        const p = parsed as Record<string, unknown>

        const trainerName = typeof p.trainerName === 'string' ? p.trainerName : DEFAULTS.trainerName
        const trainerGender = VALID_GENDERS.includes(p.trainerGender as TrainerGender)
            ? (p.trainerGender as TrainerGender)
            : DEFAULTS.trainerGender
        const selectedCreature = isValidCreature(p.selectedCreature)
            ? p.selectedCreature
            : DEFAULTS.selectedCreature

        return { trainerName, trainerGender, selectedCreature }
    } catch {
        return DEFAULTS
    }
}

// ── Provider ─────────────────────────────────────────────────────────────────

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
