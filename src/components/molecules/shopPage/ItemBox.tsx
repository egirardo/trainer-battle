import IconButton from '@/components/atoms/IconButton';
import styles from './ItemBox.module.css';
import type { Item } from '@/models/models';
import plusButton from '@/assets/sprites/components/plus-button.svg';
import minusButton from '@/assets/sprites/components/minus-button.svg';
import starIcon from '@/assets/sprites/badges/star-badge.svg';

type ItemBoxProps = {
    item: Item;
    quantity: number;
    onAdd: (itemId: number) => void;
    onRemove: (itemId: number) => void;
};

export default function ItemBox({ item, quantity, onAdd, onRemove }: ItemBoxProps) {
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
                        <img src={starIcon} alt="Credits" />
                        <span className={styles.itemPrice}>{item.price}</span>
                    </div>
                    <div className={styles.purchaseButtons}>
                        <IconButton image={minusButton} ariaLabel="Remove Item" onClick={() => onRemove(item.id)} />
                        <div className={styles.countIcon}>
                            <p className={styles.count}>{quantity}</p>
                        </div>
                        <IconButton image={plusButton} ariaLabel="Add Item" onClick={() => onAdd(item.id)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
