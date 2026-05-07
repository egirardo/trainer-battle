import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type TrainerGender = 'male' | 'female' | 'nb'

export interface TrainerCreationState {
    trainerName: string
    setTrainerName: Dispatch<SetStateAction<string>>
    trainerNameError: string | undefined
    setTrainerNameError: Dispatch<SetStateAction<string | undefined>>
    trainerGender: TrainerGender
    setTrainerGender: Dispatch<SetStateAction<TrainerGender>>
    selectedCreature: string | null
    setSelectedCreature: Dispatch<SetStateAction<string | null>>
}

export const TrainerCreationContext = createContext<TrainerCreationState | null>(null)
