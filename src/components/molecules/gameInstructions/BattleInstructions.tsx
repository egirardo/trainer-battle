import styles from './GameInstructions.module.css'

export default function BattleInstructions(){
    return(
        <div className={styles.battleInfo}>
            <p>Battles are turn-based. On your turn, choose one of three actions:</p>
            <p><span className={styles.accentText}>- Fight</span> — attack with one of your creature's moves</p>
            <p><span className={styles.accentText}>- Bag</span> — use an item from your inventory</p>
            <p><span className={styles.accentText}>- Run</span> — forfeit the battle</p>
            <div className={styles.toolTip} role="note">
                <p>Running deducts 50 credits and earns no XP — worse than a normal loss. Only use it as a last resort!</p>
            </div>
            <p>In PvP you have <span className={styles.accentText}>45 seconds</span> per turn — if time runs out, your turn is skipped automatically.</p>
            <p>Type matchups matter. Using an advantageous type deals bonus damage:</p>
            <p>Fire → Grass → Water → Fire</p>
        </div>
    )
}