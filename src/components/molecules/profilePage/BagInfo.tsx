import styles from './BagInfo.module.css';
import type { PlayerItem } from '@/models/models';
import { ITEM_EFFECT_LABELS } from '@/models/models';

interface Props {
  items: PlayerItem[];
}

export default function BagInfo({ items }: Props) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Bag</h2>
      {items.length === 0 ? (
        <p className={styles.empty}>Your bag is empty.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.itemCard}>
              {item.image && (
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              )}
              <div className={styles.itemDetails}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemEffect}>+{item.effect} {ITEM_EFFECT_LABELS[item.effect_type]}</p>
              </div>
              <span className={styles.quantity}>x{item.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
