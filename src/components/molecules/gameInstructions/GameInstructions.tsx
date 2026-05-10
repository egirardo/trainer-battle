import styles from './GameInstructions.module.css'
import BattleInstructions from './BattleInstructions'
import TypeInstructions from './TypeInstructions'

interface Props {
    onClose?: () => void;
}

export default function GameInstructions({ onClose }: Props) {
    return(
        <section>
            <div className={styles.hFixed}>
                <h2 className={styles.heading}>How to play</h2>
                <button type="button" onClick={onClose}>Close</button>
            </div>
            <article className={styles.contentContainer}>
                <div className={styles.contentSection}>
                    <h3>
                        <span className={styles.listNumber}>1</span>
                        Get started
                    </h3>
                    <p>
                        Tap <span className={styles.strong}>New Game</span> to create your trainer, pick a name and choose your starting creature.
                    </p>
                    <p>
                        Tap <span className={styles.strong}>Continue</span> to log in to your existing account.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h3>
                        <span className={styles.listNumber}>2</span>
                        Your dashboard
                    </h3>
                    <p>
                        After creating your trainer, you'll land on your Dashboard — your home base between battles. From here you can: Check your creature's HP, browse items in your Bag, visit the Shop to spend stamps, or tap the big Battle button when you're ready to fight.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h3>
                        <span className={styles.listNumber}>3</span>
                        Join a battle
                    </h3>
                    <p>
                        Tap Battle to enter the lobby, then choose your opponent: CPU OR PVP

                        {/* Probably some more info about it here */}

                        {/* 1 battle won 1 lvl - PVP */}
                        {/* 1 battle lost 50% lvl - PVP */}

                        {/* 1 battle 50% won/lost lvl - CPU */}

                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h3>
                       <span className={styles.listNumber}>4</span>
                        Fighting
                    </h3>
                    <BattleInstructions/>
                </div>
                <div className={styles.contentSection}>
                    <h3>
                        <span className={styles.listNumber}>5</span>
                        Type matchups
                    </h3>
                    <TypeInstructions/>
                </div>
                <div className={styles.contentSection}>
                    <h3>
                        <span className={styles.listNumber}>6</span>
                        Earn prizes
                    </h3>
                    <p>Win matches to earn stamps. Defeat 4 enemies to fight in a gym, and to win the highest rewards.</p>
                </div>

            </article>
        </section>
    )
}
