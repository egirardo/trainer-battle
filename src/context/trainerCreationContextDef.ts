import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Creature, TrainerGender } from '@/models/models'

export const TRAINER_CREATION_SESSION_KEY = 'trainer_creation'

export function clearCreationSession(): void {
    try {
        sessionStorage.removeItem(TRAINER_CREATION_SESSION_KEY)
    } catch {
        // Storage unavailable — no-op; the stale key will be ignored on next load
    }
}

export type { TrainerGender }

export interface TrainerCreationState {
    trainerName: string
    setTrainerName: Dispatch<SetStateAction<string>>
    trainerNameError: string | undefined
    setTrainerNameError: Dispatch<SetStateAction<string | undefined>>
    trainerGender: TrainerGender
    setTrainerGender: Dispatch<SetStateAction<TrainerGender>>
    selectedCreature: Creature | null
    setSelectedCreature: Dispatch<SetStateAction<Creature | null>>
    creatureError: string | undefined
    setCreatureError: Dispatch<SetStateAction<string | undefined>>
}

export const TrainerCreationContext = createContext<TrainerCreationState | null>(null)
