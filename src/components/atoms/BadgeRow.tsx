import styles from './BadgeRow.module.css';
import blueBadge from '@/assets/sprites/badges/blue-badge.png';
import blueBadgeShadow from '@/assets/sprites/badges/blue-badge-shadow.png';
import redBadge from '@/assets/sprites/badges/red-badge.png';
import redBadgeShadow from '@/assets/sprites/badges/red-badge-shadow.png';
import greenBadge from '@/assets/sprites/badges/green-badge.png';
import greenBadgeShadow from '@/assets/sprites/badges/green-badge-shadow.png';
import bossBadge from '@/assets/sprites/badges/boss-badge.png';
import bossBadgeShadow from '@/assets/sprites/badges/boss-badge-shadow.png';

const REGULAR_BADGES = [
    { earned: blueBadge,  shadow: blueBadgeShadow,  name: 'Blue Badge' },
    { earned: redBadge,   shadow: redBadgeShadow,   name: 'Red Badge' },
    { earned: greenBadge, shadow: greenBadgeShadow, name: 'Green Badge' },
];

const BOSS_BADGE = { earned: bossBadge, shadow: bossBadgeShadow, name: 'Boss Badge' };

interface Props {
    wins: number;
    bossBeaten: boolean;
}

export default function BadgeRow({ wins, bossBeaten }: Props) {
    const showBossBadge = wins >= 3;

    return (
        <div className={styles.badgeRow}>
            {REGULAR_BADGES.map((badge, index) => {
                const isEarned = wins > index;
                return (
                    <img
                        key={index}
                        src={isEarned ? badge.earned : badge.shadow}
                        alt={isEarned ? badge.name : `${badge.name} (locked)`}
                        className={isEarned ? styles.earned : styles.locked}
                    />
                );
            })}
            {showBossBadge && (
                <img
                    src={bossBeaten ? BOSS_BADGE.earned : BOSS_BADGE.shadow}
                    alt={bossBeaten ? BOSS_BADGE.name : `${BOSS_BADGE.name} (locked)`}
                    className={bossBeaten ? styles.earned : styles.locked}
                />
            )}
        </div>
    );
}
