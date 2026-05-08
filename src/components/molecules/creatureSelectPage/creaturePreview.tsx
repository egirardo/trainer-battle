import styles from './creaturePreview.module.css';
import type { Creature } from '@/models/models';

interface CreaturePreviewProps {
    creature: Creature | null;
}

export default function CreaturePreview({ creature }: CreaturePreviewProps) {
    if (!creature) {
        return (
            <div className={styles.creatureAvatarPreview} aria-label="No creature selected">
                <div className={styles.emptyState}>
                    <span className={styles.questionMark} aria-hidden="true">?</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.creatureAvatarPreview}>
            <img src={creature.image} alt={`${creature.name} preview`} />
        </div>
    );
}
