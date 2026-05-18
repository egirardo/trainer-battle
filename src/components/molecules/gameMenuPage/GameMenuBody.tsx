import ButtonGroup from './ButtonGroup';
import type { Trainer } from '@/models/models';
import ProfilePreview from './ProfilePreview';
import ProgressPreview from './ProgressPreview';
import styles from './GameMenuBody.module.css';
import fireCreature from '@/assets/sprites/creatures/fire-creature.png';
import BossDialog from './BossDialog';
import LifeCreditTracker from './LifeCreditTracker';

const mockTrainer: Trainer = {
  name: 'Ash Ketchum',
  trainer_gender: 'nb' as const,
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

export default function GameMenuBody() {
  const hasBoss = mockTrainer.wins >= 6;

  return (
    <div className={`${styles.gameMenuBody}${hasBoss ? ` ${styles.bossActive}` : ''}`}>
      <div className={styles.creditsRow}>
        <LifeCreditTracker />
      </div>
      <div className={styles.actionsCol}>
        <ButtonGroup horizontal={hasBoss} />
      </div>
      <div className={styles.profileCol}>
        <ProfilePreview trainer={mockTrainer} />
      </div>
      {hasBoss && (
        <div className={styles.bossCol}>
          <BossDialog />
        </div>
      )}
      <div className={styles.progressRow}>
        <ProgressPreview wins={mockTrainer.wins} />
      </div>
    </div>
  );
}