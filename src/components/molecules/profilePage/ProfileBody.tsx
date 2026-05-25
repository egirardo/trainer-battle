import type { Trainer, PlayerStats, Creature, PlayerCreature, Move, PlayerItem } from "@/models/models";
import TrainerInfo from "./TrainerInfo";
import CreatureInfo from "./CreatureInfo";
import BagInfo from "./BagInfo";

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
    <div>
      <TrainerInfo trainer={trainer} playerStats={playerStats} />
      <CreatureInfo creature={creature} playerCreature={playerCreature} moves={moves} />
      <BagInfo items={playerItems} />
    </div>
  );
}