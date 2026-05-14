import { useState } from 'react';
import BattleButton from '../../atoms/BattleButton';
import BattleBag from './BattleBag';
import type { Move, PlayerItem } from '@/models/models';
import styles from './BattleActions.module.css';

interface BattleActionsProps {
    moves: Move[];
    isMyTurn: boolean;
    playerItems: PlayerItem[];
    onFight: (moveId: number) => Promise<void> | void;
    onBag: () => void;
    onRun: () => Promise<void> | void;
    onUseItem: (itemId: number) => Promise<void> | void;
}

type Phase = 'main' | 'fight' | 'bag';

export default function BattleActions({ moves, isMyTurn, playerItems, onFight, onBag, onRun, onUseItem }: BattleActionsProps) {
    const [phase, setPhase] = useState<Phase>('main');

    function handleMoveClick(moveId: number) {
        void onFight(moveId);
        setPhase('main');
    }

    function handleUseItem(itemId: number) {
        void onUseItem(itemId);
        setPhase('main');
    }

    if (phase === 'fight') {
        return (
            <div className={styles.actions}>
                <div className={styles.moveGrid}>
                    {moves.map((move) => (
                        <BattleButton
                            key={move.id}
                            className={`${styles.moveBtn} ${styles[move.type]}`}
                            onClick={() => handleMoveClick(move.id)}
                            disabled={!isMyTurn}
                        >
                            {move.name}
                        </BattleButton>
                    ))}
                </div>
                <BattleButton className={styles.backBtn} onClick={() => setPhase('main')}>
                    Back
                </BattleButton>
            </div>
        );
    }

    if (phase === 'bag') {
        return (
            <BattleBag
                items={playerItems}
                isMyTurn={isMyTurn}
                onBack={() => setPhase('main')}
                onUse={handleUseItem}
            />
        );
    }

    return (
        <div className={styles.actions}>
            <div className={styles.btns}>
                <BattleButton
                    className={styles.actionBtn}
                    onClick={() => setPhase('fight')}
                    disabled={!isMyTurn}
                    >
                    Fight
                </BattleButton>
                <BattleButton
                    className={styles.actionBtn}
                    onClick={() => { onBag(); setPhase('bag'); }}
                >
                    Bag
                </BattleButton>
                <BattleButton
                    className={styles.actionBtn}
                    onClick={() => void onRun()}
                    >
                    Run
                </BattleButton>
            </div>
        </div>
    );
}
