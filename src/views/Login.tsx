import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTES } from '../routes';

interface LoginForm {
    email: string;
    startcode: string;
}

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState<LoginForm>({
        email: "",
        startcode: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);

        if (!form.email || !form.startcode) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.startcode,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        navigate(ROUTES.gameMenu);
        setLoading(false);
    }

    return (
        <main>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <label htmlFor="startcode">Start code</label>
                <input
                    id="startcode"
                    type="password"
                    name="startcode"
                    placeholder="Start code"
                    value={form.startcode}
                    onChange={handleChange}
                />
                {error && <p role="alert">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <Link to="/register">Don't have an account? Register</Link>
        </main>
    );
}
