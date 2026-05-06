import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function GameMenuScreen(){
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }

        navigate("/");
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return(
        <main>
            <h1>Gameplay menu</h1>
            <p>Inventory</p>
            <p>Your monsters</p>
            <p>Shop</p>
            <Link to="/lobby">Play - go to lobby</Link>

            <div>
                <h1>Login test result</h1>
                <p>Auth user: {user?.email}</p>
                <p>Profile username: {profile?.username ?? 'Not available'}</p>
                <p>Centralbank UUID: {profile?.centralbank_uuid ?? 'Not available'}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </main>
    )
}