import { useContext } from 'react'
import { TrainerCreationContext } from '../context/trainerCreationContextDef'

export function useTrainerCreation() {
    const context = useContext(TrainerCreationContext)
    if (!context) throw new Error('useTrainerCreation must be used within a TrainerCreationProvider')
    return context
}
