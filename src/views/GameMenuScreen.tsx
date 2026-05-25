import { useAuth } from '../hooks/useAuth';
import StickyHeader from '@/components/atoms/StickyHeader';
import { useNavItems } from '@/hooks/useNavItems';
import GameMenuBody from '@/components/molecules/gameMenuPage/GameMenuBody';
import LoadingScreen from '@/components/atoms/LoadingScreen';

export default function GameMenuScreen() {
    const { loading, profile } = useAuth();
    const isCentralbankUser = !!profile?.centralbank_uuid;
    const navItems = useNavItems();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <header>
                <StickyHeader label="Dashboard" navItems={navItems} />
            </header>
            <main>
                <GameMenuBody />

                {isCentralbankUser && window.parent !== window && (
                    <button
                        onClick={() =>
                            window.parent.postMessage({ type: "AMUSEMENT_CLOSE" }, "https://loopland.se")
                        }
                    >
                        Back to Loopland
                    </button>
                )}
            </main>
        </>
    )
}
