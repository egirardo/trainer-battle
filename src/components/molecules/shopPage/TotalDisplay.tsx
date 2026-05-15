import Button from '@/components/atoms/button';
import styles from './TotalDisplay.module.css';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type TotalDisplayProps = {
    total: number;
    onBuy: () => void;
};

// TODO: connect onBuy to Supabase once player_stats db is ready.
// Steps:
//   1. In ShopScreen.handleBuy, call supabase.rpc or .update to decrement player_stats.credits by total.
//   2. Insert a row into player_items for each item in the cart (item_id, quantity, player_id).
//   3. Only call setCredits / setCart({}) after both writes succeed — roll back on error.

export default function TotalDisplay({ total, onBuy }: TotalDisplayProps) {
    return (
        <div className={styles.totalDisplay}>
            <div className={styles.totalCount}>
                <p className={styles.totalText}>Total</p>
                <div className={styles.totalAmount}>
                    <img src={starIcon} alt="Credits" />
                    <p>{total}</p>
                </div>
            </div>
            <Button onClick={onBuy} disabled={total === 0} className={styles.buyButton}>Buy</Button>
        </div>
    );
}