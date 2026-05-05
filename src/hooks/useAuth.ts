import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface ApiError {
    message: string;
    status?: number;
}

interface Profile {
    id: string;
    username: string | null;
    centralbank_uuid: string | null;
    created_at: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => authListener.subscription.unsubscribe();
    }, [])

    async function fetchProfile(userId: string): Promise<void> {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            const apiError: ApiError = {
                message: error.message,
                status: error.code ? parseInt(error.code) : undefined
            };
            console.error("Error fetching profile:", apiError);
            setProfile(null);
        } else {
            setProfile(data);
        }
        setLoading(false);
    }

    return { user, loading, profile };

}