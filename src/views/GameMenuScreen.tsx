import { useAuth } from '../hooks/useAuth';
import StickyHeader from '@/components/atoms/StickyHeader';
import { useNavItems } from '@/hooks/useNavItems';
import GameMenuBody from '@/components/molecules/gameMenuPage/GameMenuBody';
import LoadingScreen from '@/components/atoms/LoadingScreen';
import { useState } from 'react';
import Overlay from '@/components/atoms/Overlay';
import CashoutIntructions from '@/components/molecules/gameInstructions/CashoutIntructions';
import GameInstructions from '@/components/molecules/gameInstructions/GameInstructions';

export default function GameMenuScreen(){
    const { loading } = useAuth();
    const [showCashoutInstructions, setShowCashoutInstructions] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const navItems = useNavItems(() => setShowInstructions(true))

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <header>
                <StickyHeader label="Dashboard" navItems={navItems} />
            </header>
            <main>
                <GameMenuBody
                    onCashoutClick={() => setShowCashoutInstructions(true)}
                    onShowInstructions={() => setShowInstructions(true)}
                />
                {showCashoutInstructions && (
                    <Overlay>
                        <CashoutIntructions onClose={() => setShowCashoutInstructions(false)} />
                    </Overlay>
                )}
                {showInstructions && (
                    <Overlay>
                        <GameInstructions onClose={() => setShowInstructions(false)} />
                    </Overlay>
                )}
            </main>
        </>
    )
}
