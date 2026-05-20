import type { Trainer, PlayerStats, Creature, PlayerCreature, Move } from "@/models/models";
import TrainerInfo from "./TrainerInfo";
import CreatureInfo from "./CreatureInfo";

interface Props {
  trainer: Trainer;
  playerStats: PlayerStats | null;
  creature: Creature;
  playerCreature: PlayerCreature;
  moves: Move[];
}

export default function ProfileBody({ trainer, playerStats, creature, playerCreature, moves }: Props) {
  return (
    <div>
      <TrainerInfo trainer={trainer} playerStats={playerStats} />
      <CreatureInfo creature={creature} playerCreature={playerCreature} moves={moves} />
    </div>
  );
}