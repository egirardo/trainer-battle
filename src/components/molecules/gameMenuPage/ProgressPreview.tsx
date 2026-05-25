import styles from './ProgressPreview.module.css';
import blueBadge from '@/assets/sprites/badges/blue-badge.png';
import blueBadgeShadow from '@/assets/sprites/badges/blue-badge-shadow.png';
import redBadge from '@/assets/sprites/badges/red-badge.png';
import redBadgeShadow from '@/assets/sprites/badges/red-badge-shadow.png';
import greenBadge from '@/assets/sprites/badges/green-badge.png';
import greenBadgeShadow from '@/assets/sprites/badges/green-badge-shadow.png';
import bossBadge from '@/assets/sprites/badges/boss-badge.png';
import bossBadgeShadow from '@/assets/sprites/badges/boss-badge-shadow.png';


const BADGE_DEFINITIONS = [
    { earned: blueBadge, shadow: blueBadgeShadow, name: 'Blue Badge' },
    { earned: redBadge, shadow: redBadgeShadow, name: 'Red Badge' },
    { earned: greenBadge, shadow: greenBadgeShadow, name: 'Green Badge' },
    { earned: bossBadge, shadow: bossBadgeShadow, name: 'Boss Badge' },
];

interface ProgressPreviewProps {
    wins: number;
    bossBeaten: boolean;
}

export default function ProgressPreview({ wins, bossBeaten }: ProgressPreviewProps) {
    return (
        <div className={styles.progressPreview}>
            <h2>Badges</h2>
            <p>Track your journey and see how far you've come! Collect 3 badges to face off against the gym leader!</p>
            <div className={styles.badgeContainer}>
                {BADGE_DEFINITIONS.map((badge, index) => {
                    const isEarned = index < BADGE_DEFINITIONS.length - 1 ? wins > index : bossBeaten;
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
