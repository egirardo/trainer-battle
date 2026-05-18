import styles from './LifeCreditTracker.module.css';
import filledHeart from '@/assets/sprites/icons/filled-heart.svg';
import emptyHeart from '@/assets/sprites/icons/empty-heart.svg';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type Props = {
  lives: number;
  credits: number;
};

export default function LifeCreditTracker({ lives, credits }: Props) {

  return (
    <div className={styles.trackerContainer}>
      <div className={styles.livesRow}>
        <img
          src={lives >= 1 ? filledHeart : emptyHeart}
          alt={lives >= 1 ? 'Life remaining' : 'No lives remaining'}
          className={styles.heartIcon}
        />
      </div>
      <div className={styles.creditsRow}>
        <img src={starIcon} alt="Credits Icon" className={styles.starIcon} />
        <span className={styles.creditsText}>{credits}</span>
      </div>
    </div>
  );
}
