import styles from './BattleLog.module.css';

interface BattleLogProps {
    messages: string[];
    isMyTurn: boolean;
}

export default function BattleLog({ messages, isMyTurn }: BattleLogProps) {
    const last = messages.at(-1);
    return (
        <div className={styles.log} aria-live="polite" aria-label="Battle messages">
            {last && <p className={styles.message}>{last}</p>}
            {isMyTurn && <p className={styles.prompt}>What will you do?</p>}
            {!isMyTurn && !last && <p className={styles.prompt}>Waiting for opponent…</p>}
        </div>
    );
}
