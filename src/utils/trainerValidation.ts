export const TRAINER_NAME_MAX_LENGTH = 20

export function validateTrainerName(name: string): string | undefined {
    if (!name.trim()) return 'Trainer name is required.'
    if (name.trim().length > TRAINER_NAME_MAX_LENGTH) return `Trainer name must be ${TRAINER_NAME_MAX_LENGTH} characters or fewer.`
    return undefined
}
