import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface RegisterForm {
    email: string;
    username: string;
    startcode: string;
}

async function verifyCentralbankStartCode(email: string, startcode: string): Promise<string | null> {
    // TODO: replace with actual API call to centralbank
    // Should return centralbank_uuid on success, null on failure

    return "mock-centralbank-uuid-1234";
}

export default function Register() {
    const navigate = useNavigate();

    const [step, setStep] = useState<"details" | "otp">("details");
    const [form, setForm] = useState<RegisterForm>({
        email:"",
        username:"",
        startcode:"",
    });
    const [ otp, setOtp ] = useState<string>("");
    const [centralbankUuid, setCentralbankUuid] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleRegister(): Promise<void> {
        setError(null);
        setLoading(true);

        // Verify startcode with centralbank
        const uuid = await verifyCentralbankStartCode(form.email, form.startcode);
        if (!uuid) {
            setError("Invalid start code or email. Please check your details and try again.");
            setLoading(false);
            return;
        }
        setCentralbankUuid(uuid);

        // send OTP via Supabase + Resend
        const { error: authError } = await supabase.auth.signInWithOtp({
            email: form.email,
            options: {
                shouldCreateUser: true
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

        const { data, error } = await supabase.auth.verifyOtp({
            email: form.email,
            token: otp,
            type: "email"
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Save username and centralbankUuid to profile
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
                setError(profileError.message);
                setLoading(false);
                return;
            }
        }

        navigate("/game-menu");
        setLoading(false);
    }

    if (step === "otp") {
        return (
            <main>
                <h1>Check your email</h1>
                <p>We sent an eight digit code to {form.email}</p>
                <input
                    type="text"
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={8}
                />
                {error && <p>{error}</p>}
                <button onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                </button>
                <button onClick={() => setStep("details")}>Back</button>
            </main>
        );
    }

    return (
        <main>
            <h1>Register</h1>
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
                type="text"
                name="startcode"
                placeholder="Start code"
                value={form.startcode}
                onChange={handleChange}
            />
            {error && <p>{error}</p>}
            <button onClick={handleRegister} disabled={loading}>
                {loading ? "Sending code..." : "Register"}
            </button>
        </main>
    );
}