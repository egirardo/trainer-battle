import type { Trainer, PlayerStats } from "@/models/models";
import TrainerInfo from "./TrainerInfo";

interface Props {
  trainer: Trainer;
  playerStats: PlayerStats | null;
}

export default function ProfileBody({ trainer, playerStats }: Props) {
  return (
    <div>
      <TrainerInfo trainer={trainer} playerStats={playerStats} />
    </div>
  );
}