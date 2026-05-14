import MenuButton from "@/components/atoms/headerButtons/MenuButton";
import StickyHeader from "@/components/atoms/StickyHeader";
import CreditsDisplay from "@/components/molecules/shopPage/CreditsDisplay";
import type { PlayerStats } from "@/models/models";

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

export default function ShopScreen() {
    return (
        <>
            <header>
                <StickyHeader label="Shop" action={<MenuButton/>}/>
            </header>
            <main>
                <CreditsDisplay credits={mockPlayerStats.credits} />
            </main>
        </>
    );
}