import styles from './GameInstructions.module.css'
import BattleInstructions from './BattleInstructions'
import ShopInstructions from './ShopInstructions'
import StickyHeader from '@/components/atoms/StickyHeader';
import CloseButton from '@/components/atoms/headerButtons/CloseButton';

interface Props {
    onClose?: () => void;
    className?: string;
}

export default function GameInstructions({ onClose, className }: Props) {
    return(
        <section className={className} aria-label="How to play">
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
                        <span className={styles.accentText}>New Game</span> let's you pick your trainer, username and your starting creature.
                    </p>
                    <p>
                        <span className={styles.accentText}>Continue</span> let's you log in to your existing account.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>2</span>
                        Your dashboard
                    </h2>
                    <p>
                        Your home base between battles. Check your creature's current stats, browse items in your <span className={styles.accentText}>Bag</span>, or visit the <span className={styles.accentText}>Shop</span> to spend credits on items.
                    </p>
                    <p>
                        Tap <span className={styles.accentText}>Find a match</span> when you're ready to fight.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>3</span>
                        The shop
                    </h2>
                    <ShopInstructions />
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>4</span>
                        Join a battle
                    </h2>
                    <p>
                        Tap <span className={styles.accentText}>Find a match</span> to enter the lobby.
                    </p>
                    <p>
                        Choose <span className={styles.accentText}>Fight vs CPU</span> to battle a computer opponent scaled to your level - you can fight the CPU up to 5 times per session, which resets with each PvP win. Or challenge another player from the lobby for a <span className={styles.accentText}>PvP</span> match.
                    </p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                       <span className={styles.listNumber}>5</span>
                        Fighting
                    </h2>
                    <BattleInstructions/>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>6</span>
                        Music
                    </h2>
                    <p>Toggle music on and off using the <span className={styles.accentText}>volume icon</span> in the navbar.</p>
                    <p>Browsers block audio until you interact with the page - if you don't hear anything, tap the volume icon once to start playback.</p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>7</span>
                        Stamps
                    </h2>
                    <p>Stamps are awarded by Tivoli.</p>
                    <p>You can view your earned stamps in your LoopLand account.</p>
                </div>
                <div className={styles.contentSection}>
                    <h2>
                        <span className={styles.listNumber}>8</span>
                        Earn prizes
                    </h2>
                    <p>Win battles to earn in-game credits and XP. Losses cost a small amount of credits but still award XP. XP levels up your creature, making it stronger.</p>
                    <p>Each PvP win earns you a badge. Collect 3 badges to unlock a fight against the final boss. </p>
                    <p>Defeating the boss lets you cash out your credits for Tivoli euros, which is only available when playing at Tivoli's LoopLand.</p>
                </div>

            </article>
        </section>
    )
}
