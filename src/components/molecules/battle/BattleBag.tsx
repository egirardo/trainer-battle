import { useState } from 'react';
import BattleButton from '../../atoms/BattleButton';
import type { PlayerItem } from '@/models/models';
import styles from './BattleBag.module.css';

interface BattleBagProps {
    items: PlayerItem[];
    isMyTurn: boolean;
    onBack: () => void;
    onUse: (itemId: number) => void;
}

export default function BattleBag({ items, isMyTurn, onBack, onUse }: BattleBagProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const hasItems = items.length > 0;

    return (
        <div className={styles.bag}>
            {hasItems ? (
                <ul className={styles.itemGrid}>
                    {items.map((item) => (
                        <li
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            aria-selected={selectedId === item.id}
                            className={`${styles.itemRow} ${selectedId === item.id ? styles.selected : ''}`}
                            onClick={() => setSelectedId(item.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedId(item.id);
                                }
                            }}
                        >
                            <span className={styles.itemName}>
                                {item.name}
                            </span>
                            <span className={styles.itemEffect}>
                                +{item.effect} HP
                            </span>
                            <span className={styles.itemQty}>
                                Qty: {item.quantity}
                            </span>

                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.empty}>No items in bag</p>
            )}
            <div className={styles.btns}>
                <BattleButton className={styles.backBtn} onClick={onBack}>Back</BattleButton>
                {hasItems && (
                    <BattleButton
                        className={styles.useBtn}
                        disabled={!isMyTurn || selectedId === null}
                        onClick={() => selectedId !== null && onUse(selectedId)}
                    >
                        Use
                    </BattleButton>
                )}
            </div>
        </div>
    );
}
