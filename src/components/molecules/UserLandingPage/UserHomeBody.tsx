import ProfilePreview from './ProfilePreview';
import styles from './UserHomeBody.module.css';
import fireCreature from '@/assets/sprites/creatures/fire-creature.png';

const mockTrainer = {
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
    // Add more mock data as needed
};

export default function UserHomeBody() {
  return (
    <div className={styles.userHomeBody}>
      <h3>Welcome to the Trainer Battle Arena!</h3>
      <ProfilePreview trainer={mockTrainer} />
    </div>
  );
}