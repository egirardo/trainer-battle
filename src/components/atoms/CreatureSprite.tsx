import type { CreatureType } from '@/models/models';
import styles from './CreatureSprite.module.css';

interface CreatureSpriteProps {
    image: string;
    name: string;
    type: CreatureType;
    isOpponent?: boolean;
}

export default function CreatureSprite({ image, name, type, isOpponent = false }: CreatureSpriteProps) {
    return (
        <img
            src={image}
            alt={name}
            className={[styles.sprite, styles[type], isOpponent ? styles.opponent : styles.player].join(' ')}
        />
    );
}
