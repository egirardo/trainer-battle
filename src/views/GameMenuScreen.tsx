import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { ROUTES } from '../routes';
import UserHomeBody from "@/components/molecules/UserLandingPage/UserHomeBody";

export default function GameMenuScreen(){
    const { loading } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error);
            return;
        }

        void navigate(ROUTES.start);
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return(
        <main>
            <UserHomeBody></UserHomeBody>
            <Link to={ROUTES.lobby}>Play - go to lobby</Link>
            <button onClick={() => handleLogout}>Logout</button>
        </main>
    )
}
