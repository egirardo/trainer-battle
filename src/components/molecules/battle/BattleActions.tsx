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
    const [selectedMoveId, setSelectedMoveId] = useState<number | null>(null);

    function handleMoveClick(moveId: number) {
        void onFight(moveId);
        setPhase('main');
        setSelectedMoveId(null);
    }

    function handleUseItem(itemId: number) {
        void onUseItem(itemId);
        setPhase('main');
    }

    if (phase === 'fight') {
        return (
            <div className={styles.actions}>
                <ul className={styles.moveList}>
                    {moves.map((move) => (
                        <li
                            key={move.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed={selectedMoveId === move.id}
                            className={`${styles.moveRow} ${selectedMoveId === move.id ? styles.selected : ''}`}
                            onClick={() => setSelectedMoveId(move.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (selectedMoveId === move.id && isMyTurn) {
                                        handleMoveClick(move.id);
                                    } else {
                                        setSelectedMoveId(move.id);
                                    }
                                }
                            }}
                        >
                            <span className={styles.moveName}>{move.name}</span>
                            <span className={`${styles.moveType} ${styles[move.type]}`}>{move.type}</span>
                            <span className={styles.movePower}>PWR {move.power}</span>
                        </li>
                    ))}
                </ul>
                <div className={styles.btns}>
                    <BattleButton className={styles.backBtn} onClick={() => setPhase('main')}>Back</BattleButton>
                    <BattleButton
                        className={styles.fightBtn}
                        disabled={!isMyTurn || selectedMoveId === null}
                        onClick={() => selectedMoveId !== null && handleMoveClick(selectedMoveId)}
                    >
                        Fight
                    </BattleButton>
                </div>
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
