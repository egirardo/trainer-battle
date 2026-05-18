import styles from './ProgressPreview.module.css';
import swordBadge from '@/assets/sprites/badges/sword-badge.svg';
import swordBadgeShadow from '@/assets/sprites/badges/sword-badge-shadow.svg';

const BADGE_DEFINITIONS = [
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
];

interface ProgressPreviewProps {
    wins: number;
}

export default function ProgressPreview({ wins }: ProgressPreviewProps) {
    return (
        <div className={styles.progressPreview}>
            <h2>Badges</h2>
            <p>Track your journey and see how far you've come! Collect all 6 badges to face off against the gym leader!</p>
            <div className={styles.badgeContainer}>
                {BADGE_DEFINITIONS.map((badge, index) => {
                    const isEarned = wins > index;
                    return (
                        <div key={index} className={styles.badge}>
                            <img
                                src={isEarned ? badge.earned : badge.shadow}
                                alt={isEarned ? badge.name : `${badge.name} (locked)`}
                                className={isEarned ? styles.badgeEarned : styles.badgeLocked}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
