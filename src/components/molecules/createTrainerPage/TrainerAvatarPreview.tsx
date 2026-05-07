import styles from './TrainerAvatarPreview.module.css';
import maleTrainer from "@/assets/sprites/trainers/test-avatar-m.svg";
import femaleTrainer from "@/assets/sprites/trainers/test-avatar-f.svg";
import nbTrainer from "@/assets/sprites/trainers/test-avatar-nb.png";


interface TrainerAvatarPreviewProps {
  trainerGender: 'male' | 'female' | 'nb';
}

export default function TrainerAvatarPreview({ trainerGender }: TrainerAvatarPreviewProps) {
  const trainerImages = {
    male: maleTrainer,
    female: femaleTrainer,
    nb: nbTrainer,
}
  return (
    <div className={styles.trainerAvatarPreview}>
      <img
        src={trainerGender ? trainerImages[trainerGender] : femaleTrainer}
        alt="Trainer avatar preview"
      />
    </div>
  );
}

// Usage:
// <TrainerAvatarPreview trainerGender="male" />
// <TrainerAvatarPreview trainerGender="female" />
// <TrainerAvatarPreview trainerGender="nb" />
// <TrainerAvatarPreview trainerGender={null} />  // defaults