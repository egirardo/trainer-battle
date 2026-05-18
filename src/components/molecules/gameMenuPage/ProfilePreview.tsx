import styles from './ProfilePreview.module.css';
import type { Trainer, TrainerGender } from '@/models/models';
import femaleTrainer from '@/assets/sprites/trainers/avatar-f.svg';
import maleTrainer from '@/assets/sprites/trainers/avatar-m.svg';
import nbTrainer from '@/assets/sprites/trainers/avatar-nb.png';
import { Link } from 'react-router-dom';
import Button from '@/components/atoms/button';
import { ROUTES } from '@/routes';

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
            <div className={styles.imageContainer}>
                <img 
                    className={styles.creatureImg} 
                    src={trainer.creature.image} 
                    alt={`${trainer.creature.name} avatar`} 
                />
                <img 
                    className={styles.trainerImg} 
                    src={trainerImages[trainer.trainer_gender]} 
                    alt={`${trainer.name} avatar`} 
                />
            </div>
            <div className={styles.titleContainer}>
                <div className={styles.trainerInfo}>
                    <h2 className={styles.profileHeading}>{trainer.name}</h2>
                    <div className={styles.levelIcon}>
                        <p className={styles.level}>{trainer.playerCreature.level}</p>
                    </div>
                </div>
                <div className={styles.creatureInfo}>
                    <p>{trainer.creature.name}</p>
                    <p className={styles.creatureType}>Type: {trainer.creature.type}</p>
                </div>
                <Button as={Link} to={`/trainers/${trainer.id}`} className={styles.viewProfileLink}>
                    View profile
                </Button>
            </div>
        </div>
    );
}