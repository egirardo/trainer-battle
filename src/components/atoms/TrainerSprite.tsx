import styles from './TrainerSprite.module.css';

interface TrainerSpriteProps {
    image: string | undefined;
    name: string;
    isOpponent?: boolean;
}

export default function TrainerSprite({ image, name, isOpponent }: TrainerSpriteProps) {
    if (!image) return null;
    return (
        <img
            src={image}
            alt={name}
            className={[styles.sprite, isOpponent ? styles.opponent : styles.player].join(' ')}
        />
    );
}