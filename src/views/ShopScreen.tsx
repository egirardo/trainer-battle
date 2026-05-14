import { useState } from "react";
import MenuButton from "@/components/atoms/headerButtons/MenuButton";
import StickyHeader from "@/components/atoms/StickyHeader";
import CreditsDisplay from "@/components/molecules/shopPage/CreditsDisplay";
import ItemBox from "@/components/molecules/shopPage/ItemBox";
import type { Item, PlayerStats } from "@/models/models";
import heart from "@/assets/sprites/icons/filled-heart.svg";

const mockPlayerStats: PlayerStats = {
    id: 1,
    player_id: '1',
    total_battles: 6,
    total_wins: 6,
    total_losses: 0,
    total_forfeits: 0,
    lives: 3,
    credits: 100,
};

const mockItem = {
    id: 1,
    name: 'Health Potion',
    description: 'Restores 50 HP to your creature.',
    effect: 50,
    price: 20,
    image: heart,
};

const mockItems: Item[] = [mockItem];

export default function ShopScreen() {
    const [cart, setCart] = useState<Record<number, number>>({});

    function handleAdd(itemId: number) {
        const item = mockItems.find(i => i.id === itemId);
        if (!item) return;
        const currentQty = cart[itemId] ?? 0;
        const totalCost = item.price * (currentQty + 1);
        if (totalCost > mockPlayerStats.credits) return;
        setCart(prev => ({ ...prev, [itemId]: currentQty + 1 }));
    }

    function handleRemove(itemId: number) {
        const currentQty = cart[itemId] ?? 0;
        if (currentQty === 0) return;
        setCart(prev => ({ ...prev, [itemId]: currentQty - 1 }));
    }

    return (
        <>
            <header>
                <StickyHeader label="Shop" action={<MenuButton/>}/>
            </header>
            <main>
                <CreditsDisplay credits={mockPlayerStats.credits} />
                {mockItems.map(item => (
                    <ItemBox
                        key={item.id}
                        item={item}
                        quantity={cart[item.id] ?? 0}
                        onAdd={handleAdd}
                        onRemove={handleRemove}
                    />
                ))}
            </main>
        </>
    );
}