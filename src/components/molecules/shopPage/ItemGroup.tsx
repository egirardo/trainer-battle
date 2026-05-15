import styles from './ItemGroup.module.css';
import type { Item } from '@/models/models';
import ItemBox from './ItemBox';

type ItemGroupProps = {
    items: Item[];
    quantities: Record<number, number>;
    onAdd: (itemId: number) => void;
    onRemove: (itemId: number) => void;
};

export default function ItemGroup({ items, quantities, onAdd, onRemove }: ItemGroupProps) {
    return (
        <div className={styles.itemGroup}>
            <div>
                {items.map((item) => (
                    <ItemBox
                        key={item.id}
                        item={item}
                        quantity={quantities[item.id] || 0}
                        onAdd={onAdd}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}