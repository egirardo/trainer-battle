import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import StickyHeader from '@/components/atoms/StickyHeader';
import { useNavItems } from '@/hooks/useNavItems';
import Overlay from '@/components/atoms/Overlay';
import Credits from '@/components/molecules/Credits';
import GameInstructions from '@/components/molecules/gameInstructions/GameInstructions';
import CreditsDisplay from '@/components/molecules/shopPage/CreditsDisplay';
import ItemBox from '@/components/molecules/shopPage/ItemBox';
import { useItems } from '@/hooks/useItems';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { useAuth } from '@/hooks/useAuth';
import styles from './ShopScreen.module.css';
import TotalDisplay from '@/components/molecules/shopPage/TotalDisplay';
import LoadingScreen from '@/components/atoms/LoadingScreen';

export default function ShopScreen() {
    const { items, loading: itemsLoading, error: itemsError } = useItems();
    const { stats, loading: statsLoading, error: statsError } = usePlayerStats();
    const { user } = useAuth();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showCredits, setShowCredits] = useState(false);
    const navItems = useNavItems(() => setShowInstructions(true), () => setShowCredits(true));
    const [spent, setSpent] = useState(0);
    const credits = (stats?.credits ?? 0) - spent;
    const [cart, setCart] = useState<Record<number, number>>({});
    const [buying, setBuying] = useState(false);
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [fundsError, setFundsError] = useState<string | null>(null);
    const [fundsErrorKey, setFundsErrorKey] = useState(0);
    const fundsErrorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (fundsErrorTimeout.current) clearTimeout(fundsErrorTimeout.current);
        };
    }, []);

    function handleAdd(itemId: number) {
        if (buying) return;
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

    async function handleBuy(): Promise<void> {
        const total = items.reduce((sum, i) => sum + i.price * (cart[i.id] ?? 0), 0);
        if (total === 0 || !user || buying) return;
        setBuying(true);

        const purchases = Object.entries(cart)
            .filter(([, qty]) => qty > 0)
            .map(([itemId, qty]) => ({ item_id: Number(itemId), quantity: qty }));

        try {
            const { error } = await supabase.rpc('purchase_items', {
                p_items: purchases,
            });

            if (error) {
                console.error('Purchase failed:', error);
                return;
            }

            setSpent(prev => prev + total);
            setCart({});
            setIsCartExpanded(false);
        } finally {
            setBuying(false);
        }
    }

    function handleRemove(itemId: number) {
        if (buying) return;
        const currentQty = cart[itemId] ?? 0;
        if (currentQty === 0) return;
        const next = { ...cart, [itemId]: currentQty - 1 };
        setCart(next);
        if (Object.values(next).every(q => q === 0)) setIsCartExpanded(false);
    }


    if (itemsLoading || statsLoading) return <LoadingScreen />;
    if (itemsError || statsError) return <p>Failed to load shop.</p>;

    return (
        <>
            <header>
                <StickyHeader label="Shop" navItems={navItems} />
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
                                disabled={buying}
                            />
                        ))}
                    </div>
                </div>
            </main>
            {showInstructions && (
                <Overlay>
                    <GameInstructions onClose={() => setShowInstructions(false)} />
                </Overlay>
            )}
            {showCredits && (
                <Overlay>
                    <Credits onClose={() => setShowCredits(false)} />
                </Overlay>
            )}
            <TotalDisplay
                total={items.reduce((sum, i) => sum + i.price * (cart[i.id] ?? 0), 0)}
                onBuy={() => void handleBuy()}
                buyDisabled={buying}
                cartItems={items
                    .filter(i => (cart[i.id] ?? 0) > 0)
                    .map(i => ({ id: i.id, name: i.name, quantity: cart[i.id] ?? 0, price: i.price }))}
                isExpanded={isCartExpanded}
                onToggleExpanded={() => setIsCartExpanded(e => !e)}
            />
            {showInstructions && (
                <Overlay>
                    <GameInstructions onClose={() => setShowInstructions(false)} />
                </Overlay>
            )}
        </>
    );
}