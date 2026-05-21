import { useTrainerData } from '@/hooks/useTrainerData';
import ProfileBody from '@/components/molecules/profilePage/ProfileBody';

export default function ProfilePageScreen() {
  const { trainer, loading, error } = useTrainerData();

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!trainer) return <p>No profile found.</p>;

  return (
    <div>
      <ProfileBody trainer={trainer} />
    </div>
  );
}
