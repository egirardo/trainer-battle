import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Button from "../components/atoms/button";
import InputField from "../components/atoms/InputField";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/routes";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const { data, error: authError } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Check is_admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", data.user.id)
            .single();

        if (!profile?.is_admin) {
            await supabase.auth.signOut();
            setError("You do not have admin access.");
            setLoading(false);
            return;
        }

        navigate(ROUTES.adminPanel);
        setLoading(false);
    }


    return (
        <main>
            <div>
                <h1>Login to admin panel</h1>
                <form onSubmit={handleLogin}>
                    <InputField
                        labelName="Email"
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter email"
                    />
                    <InputField
                        labelName="Password"
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter start code"
                    />
                    {error && <p role="alert">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </form>
            </div>
        </main>
    );
}