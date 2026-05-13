import Button from '@/components/atoms/button';
import styles from './BossDialog.module.css';

export default function BossDialog() {
    return (
        <div className={styles.bossDialog}>
            <h2>Congratz!</h2>
            <p>You have earned all six badges, thus qualifying you to take on the ultimate challenge!</p>
            <Button variant='danger'>Fight the Boss</Button>
        </div>
    );
}