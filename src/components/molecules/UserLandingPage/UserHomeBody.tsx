import type { Trainer } from '@/models/models';
import ProfilePreview from './ProfilePreview';
import ProgressPreview from './ProgressPreview';
import styles from './UserHomeBody.module.css';
import fireCreature from '@/assets/sprites/creatures/fire-creature.png';

const mockTrainer: Trainer = {
  name: 'Ash Ketchum',
  gender: 'male' as const,
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
      <ProfilePreview trainer={mockTrainer} />
      <ProgressPreview wins={mockTrainer.wins} />
    </div>
  );
}