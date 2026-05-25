import styles from './GameInstructions.module.css'
import BattleInstructions from './BattleInstructions'
import StickyHeader from '@/components/atoms/StickyHeader';
import CloseButton from '@/components/atoms/headerButtons/CloseButton';

interface Props {
    onClose?: () => void;
    className?: string;
}

export default function GameInstructions({ onClose, className }: Props) {
    return(
        <section className={className}>
            <StickyHeader
                label="How to play"
                action={<CloseButton onClick={onClose} />}
            />
            <article className={styles.contentContainer}>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>1</span>
                        Get started
                    </h2>
                    <p>
                        Tap <span className={styles.accentText}>New Game</span> to create your trainer, pick a name and choose your starting creature.
                    </p>
                    <p>
                        Tap <span className={styles.accentText}>Continue</span> to log in to your existing account.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>2</span>
                        Your dashboard
                    </h2>
                    <p>
                        After creating your trainer, you'll land on your Dashboard — your home base between battles. From here you can: Check your creature's HP, browse items in your Bag, visit the Shop to spend stamps, or tap the big Battle button when you're ready to fight.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>3</span>
                        Join a battle
                    </h2>
                    <p>
                        Tap Battle to enter the lobby, then choose your opponent: CPU OR PVP
                        {/* TODO: better desc for pvp and cpu */}
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                       <span className={styles.listNumber}>4</span>
                        Fighting
                    </h2>
                    <BattleInstructions/>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>6</span>
                        Earn prizes
                    </h2>
                    <p>Win matches to earn stamps. Defeat 4 enemies to fight in a gym, and to win the highest rewards.</p>
                </div>

            </article>
        </section>
    )
}
