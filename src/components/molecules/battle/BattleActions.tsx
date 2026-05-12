import { useState } from 'react';
import Button from '@/components/atoms/button';
import type { Move } from '@/models/models';
import styles from './BattleActions.module.css';

interface BattleActionsProps {
    moves: Move[];
    isMyTurn: boolean;
    onFight: (moveId: number) => void;
    onBag: () => void;
    onRun: () => void;
}

type Phase = 'main' | 'fight';

export default function BattleActions({ moves, isMyTurn, onFight, onBag, onRun }: BattleActionsProps) {
    const [phase, setPhase] = useState<Phase>('main');

    function handleMoveClick(moveId: number) {
        onFight(moveId);
        setPhase('main');
    }

    if (phase === 'fight') {
        return (
            <div className={styles.actions}>
                <div className={styles.moveGrid}>
                    {moves.map((move) => (
                        <Button
                            key={move.id}
                            className={`${styles.moveBtn} ${styles[move.type]}`}
                            onClick={() => handleMoveClick(move.id)}
                            disabled={!isMyTurn}
                        >
                            {move.name}
                        </Button>
                    ))}
                </div>
                <Button className={styles.backBtn} onClick={() => setPhase('main')}>
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.actions}>
            <Button
                className={styles.actionBtn}
                onClick={() => setPhase('fight')}
                disabled={!isMyTurn}
            >
                Fight
            </Button>
            <Button
                className={styles.actionBtn}
                onClick={onBag}
                disabled={!isMyTurn}
            >
                Bag
            </Button>
            <Button
                className={styles.actionBtn}
                onClick={onRun}
            >
                Run
            </Button>
        </div>
    );
}
