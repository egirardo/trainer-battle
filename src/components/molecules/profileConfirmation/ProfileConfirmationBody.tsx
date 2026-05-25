import styles from './ProfileConfirmationBody.module.css'
import type { Creature } from '@/models/models'
import type { TrainerGender } from '@/context/trainerCreationContextDef'
import { GENDER_LABELS, GENDER_SYMBOLS } from '@/models/models'
import Button from '@/components/atoms/button'
import maleTrainer from '@/assets/sprites/trainers/avatar-m.png'
import femaleTrainer from '@/assets/sprites/trainers/avatar-f.png'
import nbTrainer from '@/assets/sprites/trainers/avatar-nb.png'

const trainerImages: Record<TrainerGender, string> = {
    male: maleTrainer,
    female: femaleTrainer,
    nb: nbTrainer,
}

interface ProfileConfirmationBodyProps {
    trainerName: string
    trainerGender: TrainerGender
    creature: Creature
    onConfirm: () => void
    saving: boolean
    error: string | null
}

export default function ProfileConfirmationBody({
    trainerName,
    trainerGender,
    creature,
    onConfirm,
    saving,
    error,
}: ProfileConfirmationBodyProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>

                {/* Sprites */}
                <div className={styles.sprites}>
                    <img
                        className={styles.trainerSprite}
                        src={trainerImages[trainerGender]}
                        alt={`${GENDER_LABELS[trainerGender]} trainer`}
                    />
                    <img
                        className={styles.creatureSprite}
                        src={creature.image}
                        alt={creature.name}
                    />
                </div>

                {/* Trainer info */}
                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Trainer</p>
                    <div className={styles.trainerRow}>
                        <span className={styles.trainerName}>{trainerName}</span>
                        <p className={styles.genderLabelText}>{GENDER_LABELS[trainerGender]}</p>
                        <span className={styles.genderLabel} aria-label={GENDER_LABELS[trainerGender]}>
                            {GENDER_SYMBOLS[trainerGender]}
                        </span>
                    </div>
                </div>

                {/* Creature info */}
                <div className={styles.section}>
                    <p className={styles.sectionLabel}>Creature</p>
                    <div className={styles.creatureRow}>
                        <span className={styles.creatureName}>{creature.name}</span>
                        <span className={styles.creatureType}>{creature.type}</span>
                    </div>
                    <dl className={styles.stats}>
                        <div className={styles.statRow}>
                            <dt className={styles.statLabel}>HP</dt>
                            <dd className={styles.statValue}>{creature.base_hp}</dd>
                        </div>
                        <div className={styles.statRow}>
                            <dt className={styles.statLabel}>ATK</dt>
                            <dd className={styles.statValue}>{creature.base_attack}</dd>
                        </div>
                        <div className={styles.statRow}>
                            <dt className={styles.statLabel}>DEF</dt>
                            <dd className={styles.statValue}>{creature.base_defence}</dd>
                        </div>
                        <div className={styles.statRow}>
                            <dt className={styles.statLabel}>SPD</dt>
                            <dd className={styles.statValue}>{creature.base_speed}</dd>
                        </div>
                    </dl>
                </div>

                {/* Error */}
                {error && (
                    <span className={styles.error} role="alert">{error}</span>
                )}

                {/* Confirm button */}
                <div className={styles.actions}>
                    <Button onClick={onConfirm} disabled={saving}>
                        {saving ? 'Saving...' : 'Confirm & Start'}
                    </Button>
                </div>

            </div>
        </div>
    )
}
