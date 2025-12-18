
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { processSite } from "@/lib/cron-utils";
import type { MonitoredSite } from "@/lib/types";


export async function GET(request: Request) {
  // In a production environment, we require the cron secret.
  // In development, we bypass this for easier testing.
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const allResults = [];
    const BATCH_SIZE = 10;
    
    // Fetch all due sites (including pending ones) using the improved RPC function.
    const { data: dueSitesData, error: dueError } = await supabaseAdmin.rpc('get_due_websites');

    if (dueError) {
        console.error("Cron Error: Failed to fetch due sites.", dueError);
        return new Response(JSON.stringify({ message: "Internal Server Error", error: "Failed to fetch due sites." }), { status: 500 });
    }
    
    if (!dueSitesData || dueSitesData.length === 0) {
      return NextResponse.json({ message: "No websites to check at this time." });
    }

    const dueSites = dueSitesData as MonitoredSite[];

    for (let i = 0; i < dueSites.length; i += BATCH_SIZE) {
        const batch = dueSites.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(site => processSite(supabaseAdmin, site));
        allResults.push(...await Promise.all(batchPromises));
    }
    
    return NextResponse.json({ message: `${allResults.length} website(s) checked.`, results: allResults });

  } catch (error) {
    console.error("Error during cron job execution:", error);
    if (error instanceof Error) {
       return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), { status: 500 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
