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
      <img src={creature.image} alt={`${creature.name} sprite`} className={styles.creatureImage} />
      <div className={styles.info}>
        <h2 className={styles.name}>{creature.name}</h2>
        <p className={styles.type}>{creature.type}</p>
        <p className={styles.description}>{creature.description}</p>
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <p className={styles.statLabel}>HP</p>
            <p className={styles.statValue}>{playerCreature.current_hp ?? 0} / {creature.base_hp}</p>
          </div>
          <div className={styles.statRow}>
            <p className={styles.statLabel}>Attack</p>
            <p className={styles.statValue}>{creature.base_attack}</p>
          </div>
          <div className={styles.statRow}>
            <p className={styles.statLabel}>Defence</p>
            <p className={styles.statValue}>{creature.base_defence}</p>
          </div>
          <div className={styles.statRow}>
            <p className={styles.statLabel}>Speed</p>
            <p className={styles.statValue}>{creature.base_speed}</p>
          </div>
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
      </div>
    </div>
  );
}