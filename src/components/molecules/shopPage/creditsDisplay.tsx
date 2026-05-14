import styles from './CreditsDisplay.module.css';
import starIcon from '@/assets/sprites/badges/star-badge.svg';
import type { PlayerStats } from '@/models/models';

type CreditsDisplayProps = Pick<PlayerStats, 'credits'>;

export default function CreditsDisplay({ credits }: CreditsDisplayProps) {
    return (
        <div className={styles.creditsContainer}>
            <div className={styles.creditsHeader}>
                <h2>Your Credits</h2>
            </div>
            <div className={styles.creditsDisplay} aria-label={`Player has ${credits} credits`}>
                <img src={starIcon} alt="Credits Icon" className={styles.starIcon} />
                <span className={styles.creditsText}>{credits}</span>
            </div>
        </div>
    );
}