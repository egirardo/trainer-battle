import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../routes';
import NavigableHeader, { type NavItem } from '@/components/molecules/NavigableHeader';
import GameMenuBody from '@/components/molecules/gameMenuPage/GameMenuBody';

export default function GameMenuScreen(){
    const { loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }

        void navigate(ROUTES.start);
    }

    const navItems: NavItem[] = [
        { label: 'Dashboard', to: ROUTES.gameMenu },
        { label: 'Lobby', to: ROUTES.lobby },
        { label: 'Shop', to: ROUTES.shop },
        { label: 'Help', to: ROUTES.help },
        { label: 'Credits', to: ROUTES.credits },
        { label: 'View Profile', to: ROUTES.profile },
        { label: 'Logout', onClick: () => void handleLogout(), variant: 'danger' },
    ]

    if (loading) {
        return <p>Loading...</p>;
    }

    return(
        <>
            <header>
                <NavigableHeader label="Dashboard" navItems={navItems} />
            </header>
            <main>
                <GameMenuBody />
            </main>
        </>
    )
}
