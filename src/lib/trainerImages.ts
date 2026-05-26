import avatarF from '@/assets/sprites/trainers/avatar-f.png';
import avatarM from '@/assets/sprites/trainers/avatar-m.png';
import avatarNb from '@/assets/sprites/trainers/avatar-nb.png';
import type { TrainerGender } from '@/models/models';

const TRAINER_IMAGES: Record<TrainerGender, string> = {
  male: avatarM,
  female: avatarF,
  nb: avatarNb,
};

const GENDERS: TrainerGender[] = ['male', 'female', 'nb'];

export function getTrainerImage(gender: TrainerGender): string {
  return TRAINER_IMAGES[gender];
}

export function randomTrainerGender(): TrainerGender {
  return GENDERS[Math.floor(Math.random() * GENDERS.length)];
}
