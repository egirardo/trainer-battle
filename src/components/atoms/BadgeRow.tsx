import styles from './BadgeRow.module.css';
import blueBadge from '@/assets/sprites/badges/blue-badge.png';
import blueBadgeShadow from '@/assets/sprites/badges/blue-badge-shadow.png';
import redBadge from '@/assets/sprites/badges/red-badge.png';
import redBadgeShadow from '@/assets/sprites/badges/red-badge-shadow.png';
import greenBadge from '@/assets/sprites/badges/green-badge.png';
import greenBadgeShadow from '@/assets/sprites/badges/green-badge-shadow.png';
import bossBadge from '@/assets/sprites/badges/boss-badge.png';
import bossBadgeShadow from '@/assets/sprites/badges/boss-badge-shadow.png';

const BADGE_DEFINITIONS = [
    { earned: blueBadge,  shadow: blueBadgeShadow,  name: 'Blue Badge' },
    { earned: redBadge,   shadow: redBadgeShadow,   name: 'Red Badge' },
    { earned: greenBadge, shadow: greenBadgeShadow, name: 'Green Badge' },
    { earned: bossBadge,  shadow: bossBadgeShadow,  name: 'Boss Badge' },
];

interface Props {
    wins: number;
    bossBeaten: boolean;
}

export default function BadgeRow({ wins, bossBeaten }: Props) {
    return (
        <div className={styles.badgeRow}>
            {BADGE_DEFINITIONS.map((badge, index) => {
                const isEarned = index < BADGE_DEFINITIONS.length - 1 ? wins > index : bossBeaten;
                return (
                    <img
                        key={index}
                        src={isEarned ? badge.earned : badge.shadow}
                        alt={isEarned ? badge.name : `${badge.name} (locked)`}
                        className={isEarned ? styles.earned : styles.locked}
                    />
                );
            })}
        </div>
    );
}
