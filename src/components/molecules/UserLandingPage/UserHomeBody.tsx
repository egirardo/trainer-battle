import ButtonGroup from './ButtonGroup';
import type { Trainer } from '@/models/models';
import ProfilePreview from './ProfilePreview';
import ProgressPreview from './ProgressPreview';
import styles from './UserHomeBody.module.css';
import fireCreature from '@/assets/sprites/creatures/fire-creature.png';
import BossDialog from './BossDialog';

const mockTrainer: Trainer = {
  name: 'Ash Ketchum',
  gender: 'male' as const,
  trainer_gender: 'male',
  creature: {
    id: 1,
    name: 'Pikachu',
    type: 'fire' as const,
    base_hp: 35,
    base_attack: 55,
    base_defence: 40,
    base_speed: 90,
    description: 'A small, yellow mouse-like Pokémon.',
    image: fireCreature,
  },
  playerCreature: {
    id: 1,
    player_id: '1',
    creature_id: 1,
    nickname: null,
    level: 12,
    experience: null,
    current_hp: null,
    attack: null,
    defence: null,
    speed: null,
  },
  id: '1',
  centralbank_uuid: 'centralbank-uuid',
  username: 'ash-ketchum',
  wins: 6,
  losses: 0,
  is_admin: false,
  created_at: new Date().toISOString(),
};

export default function UserHomeBody() {
  return (
    <div className={styles.userHomeBody}>
      <ButtonGroup />
      {mockTrainer.wins >= 6 && (
        <BossDialog />
      )} {/* Conditionally render BossDialog if trainer has 6 or more wins, this logic can change later based on what we decide in terms of win criteria */}
      <ProfilePreview trainer={mockTrainer} />
      <ProgressPreview wins={mockTrainer.wins} />
    </div>
  );
}