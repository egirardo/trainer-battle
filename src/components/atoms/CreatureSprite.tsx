import styles from './CreatureSprite.module.css';

interface CreatureSpriteProps {
    image: string;
    name: string;
    isOpponent?: boolean;
}

export default function CreatureSprite({ image, name, isOpponent = false }: CreatureSpriteProps) {
    return (
        <img
            src={image}
            alt={name}
            className={[styles.sprite, isOpponent ? styles.opponent : styles.player].join(' ')}
        />
    );
}
