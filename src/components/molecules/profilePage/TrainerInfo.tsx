import styles from './TrainerInfo.module.css';
import { Trainer } from '@/models/models';

interface Props {
  trainer: Trainer;
}

export default function TrainerInfo({ trainer }: Props) {


  return (
    <div className={styles.wrapper}>
      <h2 className={styles.username}>{trainer.username}</h2>
      <div className={styles.infoRow}>
        <p className={styles.infoLabel}>Trainer ID:</p>
        <p className={styles.infoValue}>{trainer.id}</p>
      </div>
      <div className={styles.infoRow}>
        <p className={styles.infoLabel}>Gender:</p>
        <p className={styles.infoValue}>{trainer.trainer_gender}</p>
      </div>
    </div>
  );
}