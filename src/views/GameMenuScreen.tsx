import { useAuth } from '../hooks/useAuth';
import StickyHeader from '@/components/atoms/StickyHeader';
import { useNavItems } from '@/hooks/useNavItems';
import GameMenuBody from '@/components/molecules/gameMenuPage/GameMenuBody';
import LoadingScreen from '@/components/atoms/LoadingScreen';
import { useState } from 'react';
import Overlay from '@/components/atoms/Overlay';
import CashoutIntructions from '@/components/molecules/gameInstructions/CashoutIntructions';

export default function GameMenuScreen(){
    const { loading } = useAuth();
    const [showCashoutInstructions, setShowCashoutInstructions] = useState(false);

    const navItems = useNavItems()

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <header>
                <StickyHeader label="Dashboard" navItems={navItems} />
            </header>
            <main>
                <GameMenuBody onCashoutClick={() => setShowCashoutInstructions(true)} />
                {showCashoutInstructions && (
                    <Overlay>
                        <CashoutIntructions onClose={() => setShowCashoutInstructions(false)} />
                    </Overlay>
                )}
            </main>
        </>
    )
}
