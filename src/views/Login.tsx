import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
    const navigate = useNavigate();

    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleRequestOtp(): Promise<void> {
        setError(null)
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }
        setStep("otp");
        setLoading(false);
    }

    async function handleVerifyOtp(): Promise<void> {
        setError(null);
        setLoading(true);

        const { error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: "email"
        });

        if (verifyError) {
            setError(verifyError.message);
            setLoading(false);
            return;
        }

        navigate("/game-menu");
        setLoading(false);
    }

    if (step === "otp") {
        return (
            <main>
                <h1>Check your email</h1>
                <p>We sent an eight digit code to {email}</p>
                <label htmlFor="otp">Enter code</label>
                <input
                    id="otp"
                    type="text"
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={8}
                />
                {error && <p role="alert">{error}</p>}
                <button onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>
                <button onClick={() => setStep("email")}>Back</button>
            </main>
        );
    }

    return (
        <main>
            <h1>Login</h1>
            <label htmlFor="email">Email</label>
            <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p role="alert">{error}</p>}
            <button onClick={handleRequestOtp} disabled={loading}>
                {loading ? "Sending code..." : "Send code"}
            </button>
            <Link to="/register">Don't have an account? Register</Link>
        </main>
    );
}