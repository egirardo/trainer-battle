import ButtonGroup from './ButtonGroup';
import ProfilePreview from './ProfilePreview';
import ProgressPreview from './ProgressPreview';
import styles from './GameMenuBody.module.css';
import BossDialog from './BossDialog';
import LifeCreditTracker from './LifeCreditTracker';
import { PlayerStats, Trainer } from '@/models/models';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { getCreatureImage } from '@/lib/creatureImages';
import { ROUTES } from '@/routes';
import GameInstructions from '../gameInstructions/GameInstructions';
import Overlay from '@/components/atoms/Overlay';
import LoadingScreen from '@/components/atoms/LoadingScreen';


type TrainerPreview = Omit<Trainer, 'is_admin' | 'created_at' | 'wins' | 'losses'>;

type PlayerCreatureData = {
  id: number;
  level: number | null;
  creature_id: number;
  player_id: string;
  nickname: string | null;
  experience: number | null;
  current_hp: number | null;
  attack: number | null;
  defence: number | null;
  speed: number | null;
  creatures: {
    id: number;
    name: string | null;
    type: string | null;
    image: string | null;
    base_hp: number | null;
    base_attack: number | null;
    base_defence: number | null;
    base_speed: number | null;
    description: string | null;
  } | null;
};


export default function GameMenuBody() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const [trainer, setTrainer] = useState<TrainerPreview | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  useEffect(() => {
    if (!userId) return;

    async function fetchTrainerData() {
      const [profileResult, pcResult, statsResult] = await Promise.all([
        supabase.from('profiles').select('id, username, trainer_gender, centralbank_uuid').eq('id', userId!).maybeSingle(),
        supabase.from('player_creatures').select('id, level, creature_id, player_id, nickname, experience, current_hp, attack, defence, speed, creatures(id, name, type, image, base_hp, base_attack, base_defence, base_speed, description)').eq('player_id', userId!).maybeSingle(),
        supabase.from('player_stats').select('*').eq('player_id', userId!).maybeSingle(),
      ]);

      if (profileResult.error || pcResult.error || statsResult.error) {
        setError('Failed to load player data.');
        setLoading(false);
        return;
      }

      if (!profileResult.data || !pcResult.data) {
        void navigate(ROUTES.characterSelect, { replace: true });
        setLoading(false);
        return;
      }

      const profile = profileResult.data;
      const pc = pcResult.data as PlayerCreatureData;
      const creatureRaw = (Array.isArray(pc.creatures) ? pc.creatures[0] : pc.creatures) as NonNullable<PlayerCreatureData['creatures']> | undefined;

      if (!creatureRaw) {
        void navigate(ROUTES.characterSelect, { replace: true });
        setLoading(false);
        return;
      }

      const fallbackStatsInsert = {
        player_id: userId!,
        credits: 0,
        starting_credits: 0,
        total_battles: 0,
        total_wins: 0,
        total_losses: 0,
        total_forfeits: 0,
        lives: 3,
        transaction_id: null,
      }

      const fallbackStats: PlayerStats = {
        id: 0,
        player_id: userId!,
        total_battles: 0,
        total_wins: 0,
        total_losses: 0,
        total_forfeits: 0,
        lives: 3,
        credits: 0,
      }

      if (statsResult.data) {
        setPlayerStats(statsResult.data)
      } else {
        setPlayerStats(fallbackStats)
        void supabase.from('player_stats').upsert(fallbackStatsInsert, { onConflict: 'player_id' })
      }

      setTrainer({
        id: profile.id,
        name: profile.username ?? '',
        username: profile.username,
        centralbank_uuid: profile.centralbank_uuid ?? '',
        trainer_gender: (profile.trainer_gender as Trainer['trainer_gender']) ?? 'nb',
        creature: {
          id: creatureRaw.id,
          name: creatureRaw.name ?? '',
          type: (creatureRaw.type as Trainer['creature']['type']) ?? 'fire',
          base_hp: creatureRaw.base_hp ?? 0,
          base_attack: creatureRaw.base_attack ?? 0,
          base_defence: creatureRaw.base_defence ?? 0,
          base_speed: creatureRaw.base_speed ?? 0,
          description: creatureRaw.description ?? '',
          image: getCreatureImage(creatureRaw.image ?? ''),
        },
        playerCreature: {
          id: pc.id,
          player_id: pc.player_id,
          creature_id: pc.creature_id,
          nickname: pc.nickname,
          level: pc.level,
          experience: pc.experience,
          current_hp: pc.current_hp,
          attack: pc.attack,
          defence: pc.defence,
          speed: pc.speed,
        },
      });
      setLoading(false);
    }

    void fetchTrainerData();
  }, [userId]);

  const wins = playerStats?.total_wins ?? 0;
  const losses = playerStats?.total_losses ?? 0;
  const trainerWithStats = trainer ? { ...trainer, wins, losses } : null;

  if (loading) return <LoadingScreen />;
  if (error) return <p role="alert">{error}</p>;

  const hasBoss = wins >= 3; // Example condition for boss availability, adjust as needed

  return (
    <div className={`${styles.gameMenuBody}${hasBoss ? ` ${styles.bossActive}` : ''}`}>
      <div className={styles.creditsRow}>
        <LifeCreditTracker lives={playerStats?.lives ?? 0} credits={playerStats?.credits ?? 0}/>
      </div>
      <div className={styles.actionsCol}>
        <ButtonGroup horizontal />
      </div>
      <div className={styles.profileCol}>
        <ProfilePreview trainer={trainerWithStats} />
      </div>
      <div className={styles.progressRow}>
        <ProgressPreview wins={wins} bossBeaten={playerStats?.boss_beaten ?? false} />
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