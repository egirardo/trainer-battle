import styles from './GameInstructions.module.css'

export default function BattleInstructions(){
    return(
        <div>
            <p>Battles are turn-based. On your turn, choose one of three actions:</p>
            <ul className={styles.actionList}>
                <li><span className={styles.accentText}>Fight</span> — attack with one of your creature's moves</li>
                <li><span className={styles.accentText}>Bag</span> — use an item from your inventory</li>
                <li><span className={styles.accentText}>Run</span> — forfeit the battle</li>
            </ul>
            <div className={styles.toolTip} role="note">
                <p>Running deducts 50 credits and earns no XP — worse than a normal loss. Only use it as a last resort!</p>
            </div>
            <p>In PvP you have <span className={styles.accentText}>45 seconds</span> per turn — if time runs out, your turn is skipped automatically.</p>
            <p>Type matchups matter. Using an advantageous type deals bonus damage:</p>
            <p className={styles.typeChain}>
                <span className={styles.typeFire}>Fire</span>
                {' → '}
                <span className={styles.typeGrass}>Grass</span>
                {' → '}
                <span className={styles.typeWater}>Water</span>
                {' → '}
                <span className={styles.typeFire}>Fire</span>
            </p>
        </div>
    )
}