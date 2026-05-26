import type { Trainer, PlayerStats, Creature, PlayerCreature, Move, PlayerItem } from "@/models/models";
import TrainerInfo from "./TrainerInfo";
import CreatureInfo from "./CreatureInfo";
import BagInfo from "./BagInfo";
import LifeCreditTracker from "@/components/molecules/gameMenuPage/LifeCreditTracker";
import styles from "./ProfileBody.module.css";

interface Props {
  trainer: Trainer;
  playerStats: PlayerStats | null;
  creature: Creature;
  playerCreature: PlayerCreature;
  moves: Move[];
  playerItems: PlayerItem[];
}

export default function ProfileBody({ trainer, playerStats, creature, playerCreature, moves, playerItems }: Props) {
  return (
    <div className={styles.body}>
      <div className={styles.creditsRow}>
        <LifeCreditTracker
            lives={playerStats?.lives ?? 0}
            credits={playerStats?.credits ?? 0}
            level={playerCreature?.level ?? undefined}
            experience={playerCreature?.experience ?? undefined}
          />
      </div>
      <div className={styles.trainerCol}>
        <TrainerInfo trainer={trainer} playerStats={playerStats} />
      </div>
      <div className={styles.creatureCol}>
        <CreatureInfo creature={creature} playerCreature={playerCreature} moves={moves} />
      </div>
      <div className={styles.bagRow}>
        <BagInfo items={playerItems} />
      </div>
    </div>
  );
}