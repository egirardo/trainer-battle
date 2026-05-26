import styles from './GameInstructions.module.css'

export default function ShopInstructions() {
    return (
        <div>
            <p>Spend the credits you earn from battles on items that help you in fights.</p>
            <p>Use <span className={styles.accentText}>+</span> and <span className={styles.accentText}>−</span> to add items to your cart. Once you've added something, tap <span className={styles.accentText}>View cart</span> in the bottom left to review your selection, then <span className={styles.accentText}>Buy</span> to confirm.</p>
            <p>Purchased items go straight to your <span className={styles.accentText}>Bag</span> and can be used during battle with the <span className={styles.accentText}>Bag</span> action.</p>
            <div className={styles.toolTip} role="note">
                <p>You can't spend more credits than you have — adding an item that would exceed your balance is blocked automatically.</p>
            </div>
        </div>
    )
}
