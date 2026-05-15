import { useEffect, useRef, useState } from 'react';
import MenuButton from '@/components/atoms/headerButtons/MenuButton';
import StickyHeader from '@/components/atoms/StickyHeader';
import CreditsDisplay from '@/components/molecules/shopPage/CreditsDisplay';
import ItemBox from '@/components/molecules/shopPage/ItemBox';
import { useItems } from '@/hooks/useItems';
import styles from './ShopScreen.module.css';
import TotalDisplay from '@/components/molecules/shopPage/TotalDisplay';

// TODO: replace mock credits with live data once player_stats db is updated.
// Steps to switch:
//   1. Import usePlayerStats: import { usePlayerStats } from '@/hooks/usePlayerStats';
//   2. Call the hook:          const { stats, loading: statsLoading, error: statsError } = usePlayerStats();
//   3. Replace useState(100):  const [credits, setCredits] = useState(stats?.credits ?? 0);
//      (or derive credits from stats and remove local state entirely — see handleBuy note)
//   4. Add to loading guard:   if (itemsLoading || statsLoading) ...
//   5. Add to error guard:     if (itemsError || statsError) ...
//   6. In handleBuy: call supabase to decrement player_stats.credits and insert into player_items,
//      then setCredits / clear cart only on success.

export default function ShopScreen() {
    const { items, loading: itemsLoading, error: itemsError } = useItems();
    const [credits, setCredits] = useState(100);
    const [cart, setCart] = useState<Record<number, number>>({});
    const [fundsError, setFundsError] = useState<string | null>(null);
    const [fundsErrorKey, setFundsErrorKey] = useState(0);
    const fundsErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (fundsErrorTimeout.current) clearTimeout(fundsErrorTimeout.current);
        };
    }, []);

    function handleAdd(itemId: number) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const nextCart = { ...cart, [itemId]: (cart[itemId] ?? 0) + 1 };
        const totalCost = items.reduce((sum, i) => sum + i.price * (nextCart[i.id] ?? 0), 0);

        if (totalCost > credits) {
            setFundsError('Insufficient funds.');
            setFundsErrorKey(k => k + 1);
            if (fundsErrorTimeout.current) clearTimeout(fundsErrorTimeout.current);
            fundsErrorTimeout.current = setTimeout(() => setFundsError(null), 3000);
            return;
        }

        setCart(nextCart);
    }

    function handleBuy() {
        const total = items.reduce((sum, i) => sum + i.price * (cart[i.id] ?? 0), 0);
        if (total === 0) return;
        setCredits(prev => prev - total);
        setCart({});
    }

    function handleRemove(itemId: number) {
        setCart(prev => {
            const currentQty = prev[itemId] ?? 0;
            if (currentQty === 0) return prev;
            return { ...prev, [itemId]: currentQty - 1 };
        });
    }


    if (itemsLoading) return <p>Loading...</p>;
    if (itemsError) return <p>Failed to load shop.</p>;

    return (
        <div className={styles.shopLayout}>
            <header>
                <StickyHeader label="Shop" action={<MenuButton/>}/>
            </header>
            <main className={styles.shopMain}>
                <CreditsDisplay credits={credits} />
                {fundsError && <p key={fundsErrorKey} className={styles.fundsError} role="alert" aria-atomic="true">{fundsError}</p>}
                <div className={styles.itemsScroll}>
                    <div className={styles.itemsColumn}>
                        {items.map(item => (
                            <ItemBox
                                key={item.id}
                                item={item}
                                quantity={cart[item.id] ?? 0}
                                onAdd={handleAdd}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                </div>
                <TotalDisplay total={items.reduce((sum, i) => sum + i.price * (cart[i.id] ?? 0), 0)} onBuy={handleBuy} />
            </main>
        </div>
    );
}