import styles from './LifeCreditTracker.module.css';
import filledHeart from '@/assets/sprites/icons/filled-heart.svg';
import emptyHeart from '@/assets/sprites/icons/empty-heart.svg';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type Props = {
  lives: number;
  credits: number;
  level?: number;
  experience?: number;
  xpPerLevel?: number;
};

export default function LifeCreditTracker({ lives, credits, level, experience, xpPerLevel = 100 }: Props) {
  const showXp = level != null && experience != null && xpPerLevel > 0;
  const currentXp = showXp ? experience % xpPerLevel : 0;

  return (
    <div className={styles.trackerContainer}>
      <div className={styles.livesRow} aria-label={`Lives: ${lives}`} role="img">
        {Array.from({ length: 3 }, (_, i) => (
          <img
            key={i}
            src={i < lives ? filledHeart : emptyHeart}
            alt=""
            className={styles.heartIcon}
          />
        ))}
      </div>

      {showXp && (
        <div className={styles.xpSection}>
          <div className={styles.xpLabel}>
            <span>Lv. {level}</span>
            <span>{currentXp} / {xpPerLevel} XP</span>
          </div>
          <progress
            className={styles.xpBar}
            value={currentXp}
            max={xpPerLevel}
            aria-label={`XP: ${currentXp} of ${xpPerLevel}`}
          />
        </div>
      )}

      <div className={styles.creditsRow}>
        <img src={starIcon} alt="Credits Icon" className={styles.starIcon} />
        <span className={styles.creditsText}>{credits}</span>
      </div>
    </div>
  );
}
