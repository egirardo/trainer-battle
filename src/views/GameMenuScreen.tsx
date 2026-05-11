import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { ROUTES } from '../routes';

export default function GameMenuScreen(){
    const { loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }

        navigate(ROUTES.start);
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return(
        <main>
            <h1>Gameplay menu</h1>
            <p>Inventory</p>
            <p>Your creatures</p>
            <p>Shop</p>
            <Link to={ROUTES.lobby}>Play - go to lobby</Link>
            <button onClick={handleLogout}>Logout</button>

            <Link to={ROUTES.adminPanel}>Admin panel</Link>
        </main>
    )
}