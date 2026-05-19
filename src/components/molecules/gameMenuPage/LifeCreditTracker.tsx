// TODO: Replace mock data with real player_stats once the DB is wired up.
// Fetch from player_stats via usePlayerStats() or equivalent hook, e.g.:
//   const { data: playerStats } = usePlayerStats(playerId);
//   const lives = playerStats?.lives ?? 0;
//   const credits = playerStats?.credits ?? 0;
// Then remove the MOCK_LIVES and MOCK_CREDITS constants below.
// If the parent should supply player_stats instead, update this component
// to accept props for lives and credits rather than fetching data here.

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
  { // Length is shows max amount of lives player can have
        Array.from({ length: 1 }, (_, i) => (
          <img
            key={i}
            src={i < lives ? filledHeart : emptyHeart}
            alt=""
            className={styles.heartIcon}
          />
        ))}
        <div className={styles.creditsRow}>
          <img src={starIcon} alt="Credits Icon" className={styles.starIcon} />
          <span className={styles.creditsText}>{credits}</span>
        </div>
      </div>
    </div>
  );
}
