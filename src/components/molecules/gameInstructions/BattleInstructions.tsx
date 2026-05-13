import styles from './GameInstructions.module.css'
export default function BattleInstructions(){
    return(
        <>
            <p>Battles are turn-based. On your turn, choose one of three actions:</p>
            <p><span className={styles.strong}>- Fight</span> to attack with one of your moves</p>
            <p><span className={styles.strong}>- Bag</span> to use an item on your creature</p>
            <p><span className={styles.strong}>- Run</span> to escape the battle</p>
            <div className={styles.toolTip}>
                <p>You can run from any battle, but you won't earn stamps. Save running for fights you can't win!</p>
            </div>
            <p>Each creature has a type and some types beat others. Using the right matchup deals more damage.</p>
            <p>Fire → Grass → Water → Fire.</p>
        </>
    )
}