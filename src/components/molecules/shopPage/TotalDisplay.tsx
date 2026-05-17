import { useState } from 'react';
import Button from '@/components/atoms/button';
import styles from './TotalDisplay.module.css';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type CartItem = {
    id: number;
    name: string;
    quantity: number;
    price: number;
};

type TotalDisplayProps = {
    total: number;
    onBuy: () => void;
    cartItems: CartItem[];
};

// TODO: connect onBuy to Supabase once player_stats db is ready.
// Steps:
//   1. In ShopScreen.handleBuy, call supabase.rpc or .update to decrement player_stats.credits by total.
//   2. Insert a row into player_items for each item in the cart (item_id, quantity, player_id).
//   3. Only call setCredits / setCart({}) after both writes succeed — roll back on error.

export default function TotalDisplay({ total, onBuy, cartItems }: TotalDisplayProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasItems = cartItems.length > 0;
    const showCart = isExpanded && hasItems;

    return (
        <div className={styles.totalDisplay}>
            {showCart && (
                <ul className={styles.cartList}>
                    {cartItems.map(item => (
                        <li key={item.id} className={styles.cartItem}>
                            <span>{item.name}</span>
                            <span className={styles.cartItemPrice}>
                                ×{item.quantity} (★{item.price}/ea )
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <div className={styles.totalCount}>
                <p className={styles.totalText}>Total</p>
                <div className={styles.totalAmount}>
                    <img src={starIcon} alt="Credits" />
                    <p>{total}</p>
                </div>
            </div>
            <div className={styles.actions}>
                <button
                    className={styles.viewCartButton}
                    onClick={() => setIsExpanded(e => !e)}
                    disabled={!hasItems}
                >
                    {isExpanded ? "Hide cart" : "View cart"}
                </button>
                <Button onClick={onBuy} disabled={total === 0} className={styles.buyButton}>Buy</Button>
            </div>
        </div>
    );
}
