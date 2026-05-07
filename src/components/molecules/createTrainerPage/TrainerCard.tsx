import styles from './TrainerCard.module.css';
import maleTrainer from "@/assets/sprites/trainers/test-avatar-m.svg";
import femaleTrainer from "@/assets/sprites/trainers/test-avatar-f.svg";
import nbTrainer from "@/assets/sprites/trainers/test-avatar-nb.png";


interface TrainerCardProps {
  trainerName: string;
  trainerGender: 'male' | 'female' | 'nb' | null;
}

export default function TrainerCard({ trainerName, trainerGender }: TrainerCardProps) {
  const trainerImages = {
    male: maleTrainer,
    female: femaleTrainer,
    nb: nbTrainer,
}
  return (
    <div className={styles.trainerCard}>
      <h2>Trainer Name: <span style={{ fontFamily: 'var(--pixel-regular)' }}>{trainerName}</span></h2>
      <img
        src={trainerGender ? trainerImages[trainerGender] : femaleTrainer}
        alt="Trainer avatar preview"
      />
    </div>
  );
}

// Usage:
// <TrainerCard trainerName="Ash" trainerGender="male" />
// <TrainerCard trainerName="Misty" trainerGender="female" />
// <TrainerCard trainerName="Alex" trainerGender="nb" />
// <TrainerCard trainerName="Jamie" trainerGender={null} />  // defaults