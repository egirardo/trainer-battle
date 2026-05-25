import styles from './creatureInfo.module.css';
import type { Creature } from '@/models/models';

interface CreatureInfoProps {
    creature: Creature;
}

export default function CreatureInfo({ creature }: CreatureInfoProps) {
    return (
        <div className={styles.creatureInfo}>
            <h2 className={styles.name}>{creature.name}</h2>
            <p className={styles.type}>{creature.type}</p>
            <p className={styles.description}>{creature.description}</p>
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
    );
}
