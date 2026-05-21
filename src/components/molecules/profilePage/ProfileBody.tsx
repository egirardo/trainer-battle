import { Trainer } from "@/models/models";
import TrainerInfo from "./TrainerInfo";

interface Props {
  trainer: Trainer;
}

export default function ProfileBody({ trainer }: Props) {
  return (
    <div>
      <TrainerInfo trainer={trainer} />
    </div>
  );
}