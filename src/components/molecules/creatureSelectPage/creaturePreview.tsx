import styles from './creaturePreview.module.css';
import type { Creature } from '@/models/models';

interface CreaturePreviewProps {
    creature: Creature | null;
}

export default function CreaturePreview({ creature }: CreaturePreviewProps) {
    if (!creature) {
        return (
            <div className={styles.creatureAvatarPreview}>
                <div className={styles.emptyState}>
                    <span className={styles.questionMark}>?</span>
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
