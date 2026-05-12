import styles from './HealthBar.module.css';

interface HealthBarProps {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  showHpNumbers?: boolean;
}

export default function HealthBar({
  name,
  level,
  currentHp,
  maxHp,
  showHpNumbers = true,
}: HealthBarProps) {
  // Bar color thresholds 
  const percentage = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
  const fillClass =
    percentage > 50
      ? styles.healthy
      : percentage > 25
        ? styles.warning
        : styles.danger;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.level}>LVL {level}</span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={`${styles.barFill} ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showHpNumbers && (
        <div className={styles.hpText}>
          HP {currentHp} / {maxHp}
        </div>
      )}
    </div>
  );
}
