import { useParams } from 'react-router-dom';
import { useBattle } from '@/hooks/useBattle';
import HealthBar from '@/components/atoms/HealthBar';
import CreatureSprite from '@/components/atoms/CreatureSprite';
import BattleLog from '@/components/molecules/battle/BattleLog';
import BattleActions from '@/components/molecules/battle/BattleActions';
import Button from '@/components/atoms/button';
import helpIcon from '@/assets/sprites/icons/help-icon.png';
import fireCreatureImg from '@/assets/sprites/creatures/fire-creature.png';
import waterCreatureImg from '@/assets/sprites/creatures/water-creature.png';
import type { BattleParticipantInfo } from '@/models/models';
import styles from './BattleScreen.module.css';

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

export default function BattleScreen() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const id = Number(sessionId);

    const { player: livePlayer, opponent: liveOpponent, messages, isMyTurn, loading, moves, onFight, onBag, onRun } =
        useBattle(id);

    const player = livePlayer ?? MOCK_PLAYER;
    const opponent = liveOpponent ?? MOCK_OPPONENT;

    // if (loading) {
    //     return (
    //         <main className={styles.screen}>
    //             <div className={styles.centered}>Loading battle…</div>
    //         </main>
    //     );
    // }

    return (
        <main className={styles.screen}>
            <header className={styles.header}>
                <h1 className={styles.title}>Battle</h1>
                <Button aria-label="Help" onClick={() => {}}>
                    <img src={helpIcon} alt="" width={20} height={20} style={{ imageRendering: 'pixelated' }} />
                </Button>
            </header>

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
                        type={opponent.creatureType}
                        isOpponent
                    />
                </div>

                <div className={styles.playerSpriteWrap}>
                    <CreatureSprite
                        image={player.creatureImage}
                        name={player.name}
                        type={player.creatureType}
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
                onFight={onFight}
                onBag={onBag}
                onRun={onRun}
            />
        </main>
    );
}
