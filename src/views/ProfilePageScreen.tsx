import { useTrainerData } from '@/hooks/useTrainerData';
import ProfileBody from '@/components/molecules/profilePage/ProfileBody';
import LoadingScreen from '@/components/atoms/LoadingScreen';

export default function ProfilePageScreen() {
  const { trainer, playerStats, moves, loading, error } = useTrainerData({ moves: true });

  if (loading) return <LoadingScreen />;
  if (error) return <p role="alert">{error}</p>;
  if (!trainer) return <p>No profile found.</p>;

  return (
    <div>
      <ProfileBody trainer={trainer} playerStats={playerStats} creature={trainer.creature} playerCreature={trainer.playerCreature} moves={moves} />
    </div>
  );
}
