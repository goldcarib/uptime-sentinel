import { createClient, SupabaseClient } from "@supabase/supabase-js";

// This client is used for server-side operations that need to bypass RLS.
// It uses the SERVICE_ROLE_KEY and should only be used in server-side code.
export function createSupabaseAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase URL and service key must be provided for the admin client.');
    }
    
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
