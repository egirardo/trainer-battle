import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ROUTES } from '../routes';

interface RegisterForm {
    email: string;
    username: string;
    startcode: string;
}

async function verifyCentralbankStartCode(email: string, startcode: string): Promise<string | null> {
    // TODO: replace with actual API call to centralbank
    // Should return centralbank_uuid on success, null on failure
    console.log("Verifying startcode with Centralbank...", email, startcode);
    return "mock-centralbank-uuid-1234";
}

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterForm>({
        email: "",
        username: "",
        startcode: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleRegister(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);

        if (!form.email || !form.username || !form.startcode) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);

        // Verify startcode with centralbank
        // TODO: Move this server-side via Edge Function
        const centralbankUuid = await verifyCentralbankStartCode(form.email, form.startcode);
        if (!centralbankUuid) {
            setError("Invalid start code or email. Please check your details and try again.");
            setLoading(false);
            return;
        }

        // Create Supabase auth account with startcode as password
        const { data, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.startcode,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Save username and centralbank_uuid to profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert(
                    {
                        id: data.user.id,
                        username: form.username,
                        centralbank_uuid: centralbankUuid,
                    },
                    { onConflict: "id" }
                );

            if (profileError) {
                // Auth user was created but profile setup failed — sign out to avoid
                // leaving the user in a half-initialised authenticated state.
                await supabase.auth.signOut();
                setError("Account creation failed. Please try again.");
                setLoading(false);
                return;
            }
        }

        void navigate(ROUTES.characterSelect);
    }

    return (
        <main>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
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
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
            <Link to="/login">Already have an account? Login</Link>
        </main>
    );
}
