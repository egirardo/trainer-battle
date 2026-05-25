import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTrainerData } from '@/hooks/useTrainerData';
import ProfileBody from '@/components/molecules/profilePage/ProfileBody';
import LoadingScreen from '@/components/atoms/LoadingScreen';
import StickyHeader from '@/components/atoms/StickyHeader';
import { useNavItems } from '@/hooks/useNavItems';
import Overlay from '@/components/atoms/Overlay';
import Credits from '@/components/molecules/Credits';
import GameInstructions from '@/components/molecules/gameInstructions/GameInstructions';

export default function ProfilePageScreen() {
  const { trainer, playerStats, moves, playerItems, loading, error } = useTrainerData({ moves: true });
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const navItems = useNavItems(() => setShowInstructions(true), () => setShowCredits(true));
  const { hash } = useLocation();

  // Scroll to hash anchor after async content finishes loading
  useEffect(() => {
    if (!loading && hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, hash]);

  if (loading) return <LoadingScreen />;
  if (error) return <p role="alert">{error}</p>;
  if (!trainer) return <p>No profile found.</p>;


  return (
    <>
      <header>
        <StickyHeader label="Profile" navItems={navItems}/>
      </header>
      <main>
        <ProfileBody trainer={trainer} playerStats={playerStats} creature={trainer.creature} playerCreature={trainer.playerCreature} moves={moves} playerItems={playerItems} />
        {showInstructions && (
          <Overlay>
            <GameInstructions onClose={() => setShowInstructions(false)} />
          </Overlay>
        )}
        {showCredits && (
          <Overlay>
            <Credits onClose={() => setShowCredits(false)} />
          </Overlay>
        )}
      </main>
      {showInstructions && (
        <Overlay>
          <GameInstructions onClose={() => setShowInstructions(false)} />
        </Overlay>
      )}
    </>
  );
}
