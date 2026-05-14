import styles from './BattleLog.module.css';

interface BattleLogProps {
    messages: string[];
    isMyTurn: boolean;
}

export default function BattleLog({ messages, isMyTurn }: BattleLogProps) {
    const recent = messages.slice(-2);
    return (
        <div className={styles.log} aria-live="polite" aria-label="Battle messages">
            {recent.map((msg, i) => (
                <p key={i} className={styles.message}>{msg}</p>
            ))}
            {isMyTurn && <p className={styles.prompt}>What will you do?</p>}
            {!isMyTurn && messages.length === 0 && <p className={styles.prompt}>Waiting for opponent…</p>}
        </div>
    );
}
