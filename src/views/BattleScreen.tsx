import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { useBattle } from '@/hooks/useBattle';
import HealthBar from '@/components/atoms/HealthBar';
import CreatureSprite from '@/components/atoms/CreatureSprite';
import BattleLog from '@/components/molecules/battle/BattleLog';
import BattleActions from '@/components/molecules/battle/BattleActions';
import Button from '@/components/atoms/button';
import helpIcon from '@/assets/sprites/icons/help-icon.png';
import styles from './BattleScreen.module.css';

export default function BattleScreen() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const id = Number(sessionId);

    if (!sessionId || isNaN(id)) {
        return <Navigate to={ROUTES.lobby} replace />;
    }

    return <BattleContent sessionId={id} />;
}

function BattleContent({ sessionId }: { sessionId: number }) {
    const { player, opponent, messages, isMyTurn, loading, error, moves, playerItems, onFight, onBag, onRun, onUseItem } =
        useBattle(sessionId);

    if (loading) {
        return (
            <main className={styles.screen}>
                <div className={styles.centered}>Loading battle…</div>
            </main>
        );
    }

    if (error || !player || !opponent) {
        return (
            <main className={styles.screen}>
                <div className={styles.centered}>{error ?? 'Battle data unavailable'}</div>
            </main>
        );
    }

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
                playerItems={playerItems}
                onFight={onFight}
                onBag={onBag}
                onRun={onRun}
                onUseItem={onUseItem}
            />
        </main>
    );
}
