
"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { MonitorDetails, MonitoredSite } from "@/lib/types";
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import { performCheck } from "@/lib/cron-utils";
import { revalidatePath } from "next/cache";
import { recordCheck, resolveIncident, setWebsiteStatus } from "@/lib/db";


function formatDowntimeDuration(seconds: number): string {
    if (seconds === 0) return '0m';
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
    return formatDuration(duration, {
        format: ['days', 'hours', 'minutes'],
        zero: false,
    });
}

// This function is intended for Server Components/Actions where a server client is available
export async function getMonitorDetails(supabase: SupabaseClient, websiteId: number, days: number = 7): Promise<MonitorDetails> {
    // Note: User can be null for public status pages, which is fine.
    // The RPC and selects will return data based on RLS for logged-in users,
    // and for public pages, we assume the data is accessible if the page itself is.

    // 1. Get Uptime Stats for 1, 7, 30, 365 days
    const { data: uptimeData, error: uptimeError } = await supabase.rpc('get_uptime_stats_for_website', {
        p_website_id: websiteId
    });

    if (uptimeError) {
        console.error("Error fetching uptime stats:", uptimeError);
        throw new Error("Could not fetch uptime statistics.");
    }
   
    const uptimeStats = [
        { period: 'Last 24 hours', uptime: uptimeData[0].uptime_24h.toFixed(2), incidents: uptimeData[0].incidents_24h, downtime: formatDowntimeDuration(uptimeData[0].downtime_24h) },
        { period: 'Last 7 days', uptime: uptimeData[0].uptime_7d.toFixed(2), incidents: uptimeData[0].incidents_7d, downtime: formatDowntimeDuration(uptimeData[0].downtime_7d) },
        { period: 'Last 30 days', uptime: uptimeData[0].uptime_30d.toFixed(2), incidents: uptimeData[0].incidents_30d, downtime: formatDowntimeDuration(uptimeData[0].downtime_30d) },
        { period: 'Last 365 days', uptime: uptimeData[0].uptime_365d.toFixed(2), incidents: uptimeData[0].incidents_365d, downtime: formatDowntimeDuration(uptimeData[0].downtime_365d) },
    ];


    // 2. Get Response Time Stats
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data: responseTimeHistory, error: responseTimeHistoryError } = await supabase
        .from('checks')
        .select('created_at, response_time')
        .eq('website_id', websiteId)
        .eq('status', 'up') // Only include successful checks
        .gte('created_at', since)
        .order('created_at', { ascending: true });
    
    if (responseTimeHistoryError) {
        console.error("Error fetching response time history:", responseTimeHistoryError);
        throw new Error("Could not fetch response time history.");
    }

    let avg_response_time = 0;
    let min_response_time = 0;
    let max_response_time = 0;

    if (responseTimeHistory.length > 0) {
        const responseTimes = responseTimeHistory.map(r => r.response_time);
        avg_response_time = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        min_response_time = Math.min(...responseTimes);
        max_response_time = Math.max(...responseTimes);
    }

    const responseTimeStats = {
        average: avg_response_time.toFixed(0),
        min: min_response_time.toFixed(0),
        max: max_response_time.toFixed(0),
        data: responseTimeHistory.map(r => ({ date: r.created_at, responseTime: r.response_time }))
    };

    // 3. Get Latest Incidents
    const { data: latestIncidentsData, error: incidentsError } = await supabase
        .from('incidents_with_details')
        .select('*')
        .eq('website_id', websiteId)
        .order('started_at', { ascending: false })
        .limit(10);
    
    if (incidentsError) {
        console.error("Error fetching latest incidents:", incidentsError);
        throw new Error("Could not fetch latest incidents.");
    }

    const latestIncidents = latestIncidentsData.map(i => ({
        id: i.id,
        website_id: i.website_id,
        siteName: i.site_name,
        siteUrl: i.site_url,
        status: i.status,
        startedAt: i.started_at, // Pass raw date string
        resolvedAt: i.resolved_at, // Pass raw date string
        duration: i.duration,
        reason: i.reason,
    }));


    return {
        uptimeStats,
        responseTimeStats,
        latestIncidents
    };
}


// This function is specifically for client-side components that need to fetch data.
// It creates its own server client to avoid passing the client from the component.
export async function getMonitorDetailsClient(websiteId: number, days: number = 7): Promise<MonitorDetails> {
    const supabase = createSupabaseServerClient();
    // We can re-use the main getMonitorDetails function now that it accepts the client.
    return getMonitorDetails(supabase, websiteId, days);
}


export async function recheckWebsiteAction(websiteId: number): Promise<{ success: boolean; message: string; }> {
    const supabaseAdmin = createSupabaseAdminClient();
    
    const { data: site, error } = await supabaseAdmin
        .from('websites')
        .select('*')
        .eq('id', websiteId)
        .single();
    
    if (error || !site) {
        console.error(`Recheck failed: Could not find website with ID ${websiteId}.`, error);
        return { success: false, message: "Could not find the specified website." };
    }

    try {
        const { status, reason, responseTime } = await performCheck(site);
        const lastChecked = new Date().toISOString();
        
        await recordCheck(supabaseAdmin, site.id, status, responseTime);

        if (status === 'up') {
            await setWebsiteStatus(supabaseAdmin, site.id, 'up', lastChecked);
            await resolveIncident(supabaseAdmin, site.id);
        }
        // If it's still down, we don't create a new incident, just log the check.
        // The original incident remains open.
        
        // Revalidate paths to ensure the UI updates after the check.
        revalidatePath("/");
        revalidatePath("/incidents");
        
        return { success: true, message: `Re-check complete for ${site.name}. Status: ${status}.` };

    } catch (e: any) {
        console.error(`Recheck failed for ${site.name}:`, e.message);
        return { success: false, message: `Failed to re-check ${site.name}.` };
    }
}
