import { useState } from 'react';
import ButtonGroup from './ButtonGroup';
import ProfilePreview from './ProfilePreview';
import ProgressPreview from './ProgressPreview';
import styles from './GameMenuBody.module.css';
import BossDialog from './BossDialog';
import LifeCreditTracker from './LifeCreditTracker';
import Overlay from '@/components/atoms/Overlay';
import GameInstructions from '../gameInstructions/GameInstructions';
import { useTrainerData } from '@/hooks/useTrainerData';

export default function GameMenuBody() {
  const { trainer, playerStats, loading, error } = useTrainerData({ items: false });
  const [showInstructions, setShowInstructions] = useState(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;

  const wins = playerStats?.total_wins ?? 0;
  const hasBoss = wins >= 6;

  return (
    <div className={`${styles.gameMenuBody}${hasBoss ? ` ${styles.bossActive}` : ''}`}>
      <div className={styles.creditsRow}>
        <LifeCreditTracker lives={playerStats?.lives ?? 0} credits={playerStats?.credits ?? 0} />
      </div>
      <div className={styles.actionsCol}>
        <ButtonGroup horizontal onShowInstructions={() => setShowInstructions(true)} />
      </div>
      <div className={styles.profileCol}>
        <ProfilePreview trainer={trainer} />
      </div>
      <div className={styles.progressRow}>
        <ProgressPreview wins={wins} />
      </div>
      {hasBoss && (
        <div className={styles.bossCol}>
          <BossDialog />
        </div>
      )}

      {showInstructions && (
        <Overlay>
            <GameInstructions onClose={() => setShowInstructions(false)} />
        </Overlay>
      )}
    </div>
  );
}
