import MenuButton from "@/components/atoms/headerButtons/MenuButton";
import StickyHeader from "@/components/atoms/StickyHeader";
import CreditsDisplay from "@/components/molecules/shopPage/CreditsDisplay";
import ItemBox from "@/components/molecules/shopPage/ItemBox";
import type { PlayerStats } from "@/models/models";
import heart from '@/assets/sprites/icons/filled-heart.svg';

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

export default function ShopScreen() {
    return (
        <>
            <header>
                <StickyHeader label="Shop" action={<MenuButton/>}/>
            </header>
            <main>
                <CreditsDisplay credits={mockPlayerStats.credits} />
                <ItemBox item={mockItem} onPlusClick={() => {}} onMinusClick={() => {}} />
            </main>
        </>
    );
}