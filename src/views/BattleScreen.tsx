import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { useBattle, TURN_DURATION_SECONDS } from '@/hooks/useBattle';
import HealthBar from '@/components/atoms/HealthBar';
import CreatureSprite from '@/components/atoms/CreatureSprite';
import TrainerSprite from '@/components/atoms/TrainerSprite';
import { getTrainerImage } from '@/lib/trainerImages';
import finalBossImg from '@/assets/sprites/trainers/final-boss.png';
import BattleLog from '@/components/molecules/battle/BattleLog';
import BattleActions from '@/components/molecules/battle/BattleActions';
import styles from './BattleScreen.module.css';
import StickyHeader from '@/components/atoms/StickyHeader';
import HelpButton from '@/components/atoms/headerButtons/HelpButton';
import { useState } from 'react';
import Overlay from '@/components/atoms/Overlay';
import LoadingScreen from '@/components/atoms/LoadingScreen';
import CloseButton from '@/components/atoms/headerButtons/CloseButton';
import BattleInstructions from '@/components/molecules/gameInstructions/BattleInstructions';

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
    const { player, opponent, messages, isMyTurn, isCpu, isBoss, timeRemaining, loading, error, moves, playerItems, onFight, onBag, onRun, onUseItem } =
        useBattle(sessionId);

    if (loading) return <LoadingScreen message="Loading battle…" />;

    if (error || !player || !opponent) {
        return (
            <main className={styles.screen}>
                <div className={styles.centered}>{error ?? 'Battle data unavailable'}</div>
            </main>
        );
    }

    return (
        <main className={styles.screen}>
            <StickyHeader 
                label="Battle"
                action={<HelpButton onClick={() => setShowInstructions(true)}/>}
            />
            
            <section className={styles.arena} aria-label="Battle arena">
                <div className={styles.opponentInfo}>
                    <HealthBar
                        name={opponent.trainerName}
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
                    <TrainerSprite
                        image={isBoss ? finalBossImg : getTrainerImage(opponent.trainerGender)}
                        name={opponent.trainerName}
                        isOpponent
                    />
                </div>

                <div className={styles.playerSpriteWrap}>
                    <TrainerSprite
                        image={getTrainerImage(player.trainerGender)}
                        name={player.trainerName}
                    />
                    <CreatureSprite
                        image={player.creatureImage}
                        name={player.name}
                    />
                </div>

                <div className={styles.playerInfo}>
                    <HealthBar
                        name={player.trainerName}
                        level={player.level}
                        currentHp={player.currentHp}
                        maxHp={player.maxHp}
                    />
                </div>
            </section>

            <BattleLog messages={messages} isMyTurn={isMyTurn} />

            {!isCpu && isMyTurn && (
                <div className={styles.timerBar}>
                    <span className={`${styles.timerLabel} ${timeRemaining <= 10 ? styles.timerUrgent : ''}`}>
                        {timeRemaining}s
                    </span>
                    <div
                        className={`${styles.timerFill} ${timeRemaining <= 10 ? styles.timerUrgent : ''}`}
                        style={{ width: `${(timeRemaining / TURN_DURATION_SECONDS) * 100}%` }}
                    />
                </div>
            )}

            <BattleActions
                moves={moves}
                isMyTurn={isMyTurn}
                playerItems={playerItems}
                onFight={onFight}
                onBag={onBag}
                onRun={onRun}
                onUseItem={onUseItem}
            />
            {showInstructions && (
                <Overlay>
                    <StickyHeader
                        label="How to battle"
                        action={<CloseButton onClick={() => setShowInstructions(false)} />}
                    />
                    <BattleInstructions />
                </Overlay>
            )}
        </main>
    );
}
