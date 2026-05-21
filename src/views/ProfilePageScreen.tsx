import { useTrainerData } from '@/hooks/useTrainerData';
import ProfileBody from '@/components/molecules/profilePage/ProfileBody';

export default function ProfilePageScreen() {
  const { trainer, playerStats, moves, playerItems, loading, error } = useTrainerData({ moves: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!trainer) return <p>No profile found.</p>;

  return (
    <div>
      <ProfileBody trainer={trainer} playerStats={playerStats} creature={trainer.creature} playerCreature={trainer.playerCreature} moves={moves} playerItems={playerItems} />
    </div>
  );
}
