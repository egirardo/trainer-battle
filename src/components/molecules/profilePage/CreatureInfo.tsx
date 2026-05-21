import styles from './CreatureInfo.module.css';
import type { Creature, PlayerCreature, Move } from '@/models/models';

interface Props {
    creature: Creature;
    playerCreature: PlayerCreature;
    moves: Move[];
}

export default function CreatureInfo({ creature, playerCreature, moves }: Props) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Creature</h2>
      <div className={styles.imageColumn}>
        <img src={creature.image} alt={`${creature.name} sprite`} className={styles.creatureImage} />
      </div>
      <div className={styles.info}>
        <h2 className={styles.name}>{creature.name}</h2>
        <p className={styles.type}>{creature.type}</p>
        <p className={styles.description}>{creature.description}</p>
      </div>
      {moves.length > 0 && (
        <div className={styles.moves}>
          <p className={styles.movesLabel}>Moves</p>
          <div className={styles.moveGrid}>
            {moves.map((move) => (
              <div key={move.id} className={`${styles.moveCard} ${styles[move.type] ?? ''}`}>
                <p className={styles.moveName}>{move.name}</p>
                <p className={styles.movePower}>PWR {move.power ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <dl className={styles.stats}>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>HP</dt>
          <dd className={styles.statValue}>{playerCreature.current_hp ?? 0} / {creature.base_hp}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Attack</dt>
          <dd className={styles.statValue}>{creature.base_attack}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Defence</dt>
          <dd className={styles.statValue}>{creature.base_defence}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Speed</dt>
          <dd className={styles.statValue}>{creature.base_speed}</dd>
        </div>
      </dl>
    </div>
  );
}