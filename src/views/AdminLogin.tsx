import Button from "../components/atoms/button";
import InputField from "../components/atoms/InputField";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const username = String(formData.get('username'));

        // Using fetch directly instead of the Supabase JS client because the client
        // waits for an auth session before attaching headers. If a stale session is
        // being refreshed in the background, all client queries hang indefinitely.
        // A raw fetch with the anon key bypasses that and returns immediately.
        let isAdmin: boolean;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=admin&username=eq.${encodeURIComponent(username)}&limit=1`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                }
            );
            const rows = await res.json();
            isAdmin = Array.isArray(rows) && rows[0]?.admin === true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return;
        }

        if (!isAdmin) {
            setError('Access denied.');
            return;
        }

        // No Supabase auth session is created here — admin identity is stored in
        // localStorage and checked by AdminRoute in App.tsx on each render.
        localStorage.setItem('adminUsername', username);
        navigate('/admin-panel');
    }

    return (
        <main>
            <div>
                <h1>Login to admin panel</h1>
                {error && <p>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <InputField
                        labelName="Username"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                    />
                    <Button type="submit">
                        Login
                    </Button>
                </form>
            </div>
        </main>
    );
}
