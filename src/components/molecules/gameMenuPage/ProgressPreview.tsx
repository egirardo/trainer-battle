import styles from './ProgressPreview.module.css';
import BadgeRow from '@/components/atoms/BadgeRow';

interface ProgressPreviewProps {
    wins: number;
    bossBeaten: boolean;
}

export default function ProgressPreview({ wins, bossBeaten }: ProgressPreviewProps) {
    const threeEarned = wins >= 3;

    return (
        <div className={styles.progressPreview}>
            <h2>Badges</h2>
            {threeEarned ? (
                <p>You have earned 3 of 4 badges! In order to earn the fourth badge, you must defeat the boss!</p>
            ) : (
                <p>Track your journey and see how far you've come! Collect 3 badges to face off against the boss!</p>
            )}
            <BadgeRow wins={wins} bossBeaten={bossBeaten} />
        </div>
    );
}
