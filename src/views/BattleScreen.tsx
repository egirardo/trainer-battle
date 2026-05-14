import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { useBattle } from '@/hooks/useBattle';
import HealthBar from '@/components/atoms/HealthBar';
import CreatureSprite from '@/components/atoms/CreatureSprite';
import BattleLog from '@/components/molecules/battle/BattleLog';
import BattleActions from '@/components/molecules/battle/BattleActions';
import fireCreatureImg from '@/assets/sprites/creatures/fire-creature.png';
import waterCreatureImg from '@/assets/sprites/creatures/water-creature.png';
import type { BattleParticipantInfo, PlayerItem } from '@/models/models';
import styles from './BattleScreen.module.css';
import StickyHeader from '@/components/atoms/StickyHeader';
import HelpButton from '@/components/atoms/headerButtons/HelpButton';
import { useState } from 'react';
import GameInstructions from '@/components/molecules/gameInstructions/GameInstructions';

// TODO: remove once useBattle returns real data
const MOCK_PLAYER: BattleParticipantInfo = {
    name: 'Infernus',
    level: 3,
    currentHp: 221,
    maxHp: 280,
    creatureImage: fireCreatureImg,
    creatureType: 'fire',
};
const MOCK_OPPONENT: BattleParticipantInfo = {
    name: 'Glen',
    level: 3,
    currentHp: 221,
    maxHp: 280,
    creatureImage: waterCreatureImg,
    creatureType: 'water',
};
const MOCK_ITEMS: PlayerItem[] = [
    { id: 1, name: 'Small Healing Potion', description: 'Restores a little HP', effect: 20, price: 50, quantity: 2 },
    { id: 2, name: 'Medium Healing Potion', description: 'Restores moderate HP', effect: 50, price: 100, quantity: 3 },
    { id: 3, name: 'Defence Potion', description: 'Boosts defence', effect: 30, price: 80, quantity: 1 },
];

export default function BattleScreen() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const id = Number(sessionId);

    if (!sessionId || isNaN(id)) {
        return <Navigate to={ROUTES.lobby} replace />;
    }

    return <BattleContent sessionId={id} />;
}

function BattleContent({ sessionId }: { sessionId: number }) {
    const [showInstructions, setShowInstructions] = useState(false);
    const { player: livePlayer, opponent: liveOpponent, messages, isMyTurn, loading, moves, playerItems, onFight, onBag, onRun, onUseItem } =
        useBattle(sessionId);

    const player = livePlayer ?? MOCK_PLAYER;
    const opponent = liveOpponent ?? MOCK_OPPONENT;
    const items = playerItems.length > 0 ? playerItems : MOCK_ITEMS;

    if (loading) {
        return (
            <main className={styles.screen}>
                <div className={styles.centered}>Loading battle…</div>
            </main>
        );
    }

    // if (error) {
    //     return (
    //         <main className={styles.screen}>
    //             <div className={styles.centered}>{error}</div>
    //         </main>
    //     );
    // }

    return (
        <main className={styles.screen}>
            <StickyHeader 
                label="Battle"
                action={<HelpButton onClick={() => setShowInstructions(true)}/>}
            />
            
            <section className={styles.arena} aria-label="Battle arena">
                <div className={styles.opponentInfo}>
                    <HealthBar
                        name={opponent.name}
                        level={opponent.level}
                        currentHp={opponent.currentHp}
                        maxHp={opponent.maxHp}
                    />
                </div>

                <div className={styles.opponentSpriteWrap}>
                    <CreatureSprite
                        image={opponent.creatureImage}
                        name={opponent.name}
                        isOpponent
                    />
                </div>

                <div className={styles.playerSpriteWrap}>
                    <CreatureSprite
                        image={player.creatureImage}
                        name={player.name}
                    />
                </div>

                <div className={styles.playerInfo}>
                    <HealthBar
                        name={player.name}
                        level={player.level}
                        currentHp={player.currentHp}
                        maxHp={player.maxHp}
                    />
                </div>
            </section>

            <BattleLog messages={messages} isMyTurn={isMyTurn} />

            <BattleActions
                moves={moves}
                isMyTurn={isMyTurn}
                playerItems={items}
                onFight={onFight}
                onBag={onBag}
                onRun={onRun}
                onUseItem={onUseItem}
            />
            {showInstructions && (
                <div className={styles.infoOverlay}>
                    <GameInstructions onClose={() => setShowInstructions(false)} />
                </div>
            )}
        </main>
    );
}
