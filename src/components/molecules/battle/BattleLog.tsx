import styles from './BattleLog.module.css';
import type { BattleMessage } from '@/models/models';

interface BattleLogProps {
    messages: BattleMessage[];
    isMyTurn: boolean;
}

const sideClass: Record<BattleMessage['side'], string> = {
    player: styles.messagePlayer,
    opponent: styles.messageOpponent,
    neutral: styles.message,
};

export default function BattleLog({ messages, isMyTurn }: BattleLogProps) {
    const recent = messages.slice(-2);
    return (
        <div className={styles.log} aria-live="polite" aria-label="Battle messages">
            {recent.map((msg, i) => (
                <p key={i} className={sideClass[msg.side]}>{msg.text}</p>
            ))}
            {isMyTurn && <p className={styles.prompt}>What will you do?</p>}
            {!isMyTurn && messages.length === 0 && <p className={styles.prompt}>Waiting for opponent…</p>}
        </div>
    );
}
