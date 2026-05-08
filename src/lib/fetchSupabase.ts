import { supabase } from "./supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { ApiError } from "@/models/models";

interface FetchResult<T> {
    data: T | null;
    error: ApiError | null;
}

export async function fetchFromSupabase<T>(
    queryFn: () => PromiseLike<PostgrestSingleResponse<T>>
): Promise<FetchResult<T>> {
    const { data, error } = await queryFn();

    if (error) {
        const apiError: ApiError = {
            message: error.message,
            status: error.code ? parseInt(error.code) : undefined,
        };
        console.error("Supabase fetch error:", apiError);
        return { data: null, error: apiError };
    }
    return { data, error: null };
}