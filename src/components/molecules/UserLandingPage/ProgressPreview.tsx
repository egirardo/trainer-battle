import styles from './ProgressPreview.module.css';
import swordBadge from '@/assets/sprites/badges/sword-badge.svg';
import swordBadgeShadow from '@/assets/sprites/badges/sword-badge-shadow.svg';
import starBadge from '@/assets/sprites/badges/star-badge.svg';
import starBadgeShadow from '@/assets/sprites/badges/star-badge-shadow.svg';
import Button from '@/components/atoms/button';

const BADGE_DEFINITIONS = [
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: starBadge,  shadow: starBadgeShadow,  name: 'Star Badge'  },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: starBadge,  shadow: starBadgeShadow,  name: 'Star Badge'  },
    { earned: swordBadge, shadow: swordBadgeShadow, name: 'Sword Badge' },
    { earned: starBadge,  shadow: starBadgeShadow,  name: 'Star Badge'  },
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
            <div className={styles.buttonContainer}>
                {wins >= BADGE_DEFINITIONS.length && (
                    <Button onClick={() => alert('Congratulations! You have earned all badges and can now challenge the gym leader!')}> 
                        Challenge Gym Leader
                    </Button>
                )} 
                {/* temporary alert, replace with actual navigation to gym leader battle when implemented. You can change the number of wins in the mockTrainer object in UserHomeBody.tsx to test the button */}
            </div>
        </div>
    );
}
