import styles from './TrainerInfo.module.css';
import type { Trainer, TrainerGender, PlayerStats } from '@/models/models';
import { GENDER_LABELS, GENDER_SYMBOLS } from '@/models/models';
import femaleTrainer from '@/assets/sprites/trainers/avatar-f.png';
import maleTrainer from '@/assets/sprites/trainers/avatar-m.png';
import nbTrainer from '@/assets/sprites/trainers/avatar-nb.png';

const trainerImages: Record<TrainerGender, string> = {
  female: femaleTrainer,
  male: maleTrainer,
  nb: nbTrainer,
};

interface Props {
  trainer: Trainer;
  playerStats: PlayerStats | null;
}

export default function TrainerInfo({ trainer, playerStats }: Props) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Trainer</h2>
      <div className={styles.content}>
      <img
        src={trainerImages[trainer.trainer_gender]}
        alt={`${trainer.name} avatar`}
        className={styles.trainerImage}
      />
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <div className={styles.nameBlock}>
            <h3 className={styles.name}>{trainer.name}</h3>
            <p className={styles.gender}>
              {GENDER_LABELS[trainer.trainer_gender]}
              <span aria-hidden="true" className={styles.genderSymbol}>{GENDER_SYMBOLS[trainer.trainer_gender]}</span>
            </p>
          </div>
          <div className={styles.levelBlock}>
            <p className={styles.levelLabel}>Level</p>
            <div className={styles.levelIcon}>
              <p className={styles.levelValue}>{trainer.playerCreature.level ?? 1}</p>
            </div>
          </div>
        </div>
      <dl className={styles.stats}>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Wins</dt>
          <dd className={styles.statValue}>{trainer.wins}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Losses</dt>
          <dd className={styles.statValue}>{trainer.losses}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Forfeits</dt>
          <dd className={styles.statValue}>{playerStats?.total_forfeits ?? 0}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Badges Earned</dt>
          <dd className={styles.statValue}>{Math.min(trainer.wins, 6)} / 6</dd>
        </div>
      </dl>
      </div>
      </div>
    </div>
  );
}
