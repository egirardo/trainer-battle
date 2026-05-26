import styles from './ProgressPreview.module.css';
import BadgeRow from '@/components/atoms/BadgeRow';

interface ProgressPreviewProps {
    wins: number;
    bossBeaten: boolean;
}

export default function ProgressPreview({ wins, bossBeaten }: ProgressPreviewProps) {
    return (
        <div className={styles.progressPreview}>
            <h2>Badges</h2>
            <p>Track your journey and see how far you've come! Collect 3 badges to face off against the boss!</p>
            <BadgeRow wins={wins} bossBeaten={bossBeaten} />
        </div>
    );
}
