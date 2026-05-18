import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTES } from '../routes';
import InputField from "../components/atoms/InputField";
import Button from "../components/atoms/button";
import styles from "./AuthForm.module.css";

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

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.startcode,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        const { data: profileData } = await supabase
            .from("profiles")
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileData) {
            sessionStorage.setItem('profile', JSON.stringify(profileData));
        }

        void navigate(ROUTES.gameMenu);
        setLoading(false);
    }

    return (
        <main>
            <h1>Login</h1>
            <form className={styles.form} onSubmit={(e) => void handleLogin(e)}>
                <InputField
                    id="email"
                    type="email"
                    name="email"
                    labelName="Email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <InputField
                    id="startcode"
                    type="password"
                    name="startcode"
                    labelName="Start code"
                    placeholder="Start code"
                    value={form.startcode}
                    onChange={handleChange}
                    error={error ?? undefined}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </form>
            <Link to="/register">Don't have an account? Register</Link>
        </main>
    );
}
