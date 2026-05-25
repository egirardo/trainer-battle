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
                        Your home base between battles. Check your creature's current HP and level, browse items in your <span className={styles.accentText}>Bag</span>, or visit the <span className={styles.accentText}>Shop</span> to spend credits on items.
                    </p>
                    <p>
                        Tap <span className={styles.accentText}>Find a match</span> when you're ready to fight.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>3</span>
                        Join a battle
                    </h2>
                    <p>
                        Tap <span className={styles.accentText}>Find a match</span> to enter the lobby.
                    </p>
                    <p>
                        Choose <span className={styles.accentText}>Fight vs CPU</span> to battle a computer opponent scaled to your level, or invite another player from the lobby for a <span className={styles.accentText}>PvP</span> match.
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
                        <span className={styles.listNumber}>5</span>
                        Earn prizes
                    </h2>
                    <p>Win battles to earn <span className={styles.accentText}>credits</span> and <span className={styles.accentText}>XP</span>. Losses award a small amount of credits and some XP. XP levels up your creature, making it stronger.</p>
                    <p>Each win earns you an in-game badge. Collect <span className={styles.accentText}>3 badges</span> to unlock a fight against the gym leader for the highest rewards.</p>
                </div>

            </article>
        </section>
    )
}
