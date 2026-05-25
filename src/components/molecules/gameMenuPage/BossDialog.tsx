import Button from '@/components/atoms/button';
import styles from './BossDialog.module.css';

interface Props {
    playerCreatureId: number | null;
    onFight: (creatureId: number) => void;
    loading?: boolean;
}

export default function BossDialog({ playerCreatureId, onFight, loading }: Props) {
    return (
        <div className={styles.bossDialog}>
            <h2>Congratz!</h2>
            <p>You have earned all three badges, thus qualifying you to take on the ultimate challenge!</p>
            <Button
                variant='danger'
                onClick={() => playerCreatureId && onFight(playerCreatureId)}
                disabled={!playerCreatureId || loading}
            >
                Fight the Boss
            </Button>
        </div>
    );
}