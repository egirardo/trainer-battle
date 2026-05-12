import styles from './ProfilePreview.module.css';
import type { Trainer, TrainerGender } from '@/models/models';
import femaleTrainer from '@/assets/sprites/trainers/test-avatar-f.svg';
import maleTrainer from '@/assets/sprites/trainers/test-avatar-m.svg';
import nbTrainer from '@/assets/sprites/trainers/test-avatar-nb.png';
import { Link } from 'react-router-dom';

const trainerImages: Record<TrainerGender, string> = {
    female: femaleTrainer,
    male: maleTrainer,
    nb: nbTrainer,
};

interface ProfilePreviewProps {
    trainer: Omit<Trainer, "is_admin" | "created_at"> | null;
}

export default function ProfilePreview({ trainer }: ProfilePreviewProps) {
    if (!trainer) {
        return (
            <div className={styles.profilePreviewCard} aria-label="No trainer profile available">
                <p>No profile available</p>
            </div>
        );
    }

    return (
        <div className={styles.profilePreviewCard}>
            <div className={styles.titleContainer}>
                <h2>{trainer.name}</h2>
                <p>{trainer.creature.name}</p>
            </div>
            <p className={styles.otherInfo}>Wins: {trainer.wins} | Losses: {trainer.losses}</p>
            <Link to={`/trainers/${trainer.id}`} className={styles.viewProfileLink}>
                View Full Profile
            </Link>
            <div className={styles.imageContainer}>
                <img src={trainer.creature.image} alt={`${trainer.creature.name} avatar`} />
                <img src={trainerImages[trainer.gender]} alt={`${trainer.name} avatar`} />
            </div>
            {/* Add more trainer details here as needed */}
        </div>
    );
}