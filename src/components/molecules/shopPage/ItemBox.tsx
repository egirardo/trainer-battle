import { useState } from 'react';
import IconButton from '@/components/atoms/IconButton';
import styles from './ItemBox.module.css';
import type { Item } from '@/models/models';
import plusButton from '@/assets/sprites/components/plus-button.svg';
import minusButton from '@/assets/sprites/components/minus-button.svg';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type ItemBoxProps = {
    item: Item;
    onPlusClick?: (itemId: number) => void;
    onMinusClick?: (itemId: number) => void;
};

export default function ItemBox({ item, onPlusClick, onMinusClick }: ItemBoxProps) {
    const [count, setCount] = useState(0);

    function handlePlus() {
        setCount(c => c + 1);
        onPlusClick?.(item.id);
    }

    function handleMinus() {
        setCount(c => Math.max(0, c - 1));
        onMinusClick?.(item.id);
    }

    return (
        <div className={styles.itemBox}>
            <img src={item.image} alt={item.name} className={styles.itemImage} />
            <div className={styles.item}>
                <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemDescription}>{item.description}</p>
                </div>
                <div className={styles.itemFooter}>
                    <div className={styles.priceContainer}>
                        <img src={starIcon} alt="Credits Icon" className={styles.starIcon} />
                        <span className={styles.itemPrice}>{item.price}</span>
                    </div>
                    <div className={styles.purchaseButtons}>
                        <IconButton image={minusButton} ariaLabel="Remove Item" onClick={handleMinus} />
                        <div className={styles.countIcon}>
                            <p className={styles.count}>{count}</p>
                        </div>
                        <IconButton image={plusButton} ariaLabel="Add Item" onClick={handlePlus} />
                    </div>
                </div>
            </div>
        </div>
    );
}