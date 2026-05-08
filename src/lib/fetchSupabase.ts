import type { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import type { ApiError } from "@/models/models";

interface FetchResult<T> {
    data: T | null;
    error: ApiError | null;
}

export async function fetchFromSupabase<T>(
    queryFn: () => PromiseLike<PostgrestSingleResponse<T> | PostgrestResponse<T>>
): Promise<FetchResult<T>> {
    const { data, error } = await queryFn();

    if (error) {
        const apiError: ApiError = {
            message: error.message,
            // only set status if code is actually numeric
            status: error.code && /^\d+$/.test(error.code)
                ? parseInt(error.code)
                : undefined,
        };
        console.error("Supabase fetch error:", apiError);
        return { data: null, error: apiError };
    }

    // handle both single (object) and multi-row (array) responses
    const result = Array.isArray(data) ? data[0] ?? null : data;
    return { data: result as T, error: null };
}