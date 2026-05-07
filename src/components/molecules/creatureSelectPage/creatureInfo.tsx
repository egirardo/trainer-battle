import styles from './creatureInfo.module.css';
import type { Creature } from '@/models/models';

interface CreatureInfoProps {
    creature: Creature;
}

export default function CreatureInfo({ creature }: CreatureInfoProps) {
    return (
        <div className={styles.creatureInfo}>
            <h2>{creature.name}</h2>
            <p>Type: {creature.type}</p>
            {/* Add more creature details here as needed */}
        </div>
    );
}