
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMonitorDetails } from "@/app/(main)/actions";
import { MonitorDetailsDisplay } from "./monitor-details-display";
import { PasswordPrompt } from "./password-prompt";
import { Forbidden } from "./forbidden";
import type { MonitoredSite, StatusPage } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

type PageData = StatusPage & { website: MonitoredSite };

async function getPageData(slug: string, supabase: SupabaseClient): Promise<PageData | null> {
    const { data: page, error } = await supabase
        .from('status_pages')
        .select(`
            *,
            websites (
                *
            )
        `)
        .eq('slug', slug)
        .single();
    
    if (error || !page) {
        console.error("Error fetching status page for slug:", slug, error);
        return null;
    }

    const websiteData = page.websites as MonitoredSite;
    if (!websiteData || typeof websiteData !== 'object' || Array.isArray(websiteData)) {
        console.error("Website data is missing or in an incorrect format for status page:", page.id);
        return null;
    }

    // Fetch timezone separately and directly
    let timezone = 'UTC';
    if (websiteData.user_id) {
        // Use the same admin client to bypass RLS for fetching user's timezone for the public page
        const { data: settings, error: tzError } = await supabase
            .from('notification_settings')
            .select('timezone')
            .eq('user_id', websiteData.user_id)
            .single();

        if (tzError && tzError.code !== 'PGRST116') {
             console.error(`Error fetching timezone for user ${websiteData.user_id}:`, tzError);
        }
        if (settings?.timezone) {
            timezone = settings.timezone;
        }
    }

     const websiteWithTimezone = {
        ...websiteData,
        // @ts-ignore
        user_timezone: timezone
     };


    const { websites, ...restOfPage } = page;

    return {
        ...(restOfPage as StatusPage),
        website: websiteWithTimezone as MonitoredSite,
    };
}


export default async function PublicStatusPage({ params }: { params: { slug: string } }) {
    // For public status pages, we use the admin client to bypass RLS and fetch page configuration.
    // This is safe because we are only reading data for the specific page determined by the slug.
    const supabase = createSupabaseAdminClient();
    const data = await getPageData(params.slug, supabase);

    if (!data || !data.is_public) {
        notFound();
    }

    const { website, password, allowed_ips } = data;
    // @ts-ignore
    const timezone = website.user_timezone ?? 'UTC';

    // --- Access Control ---
    const forwardedFor = headers().get('x-forwarded-for');
    const realIp = headers().get('x-real-ip');
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // 1. IP Whitelisting
    if (allowed_ips && allowed_ips.length > 0 && !allowed_ips.includes(userIp)) {
        return <Forbidden message="Access from your IP address is not allowed." detectedIp={userIp} />;
    }

    // 2. Password Protection
    if (password) {
        const cookieStore = cookies();
        const hasAuthCookie = cookieStore.has(`status-page-auth-${params.slug}`);
        if (!hasAuthCookie) {
            return <PasswordPrompt slug={params.slug} siteName={website.name} />;
        }
    }
    
    // The admin client can be passed down for subsequent reads for this public page.
    const monitorDetails = await getMonitorDetails(supabase, website.id);


    return (
        <main className="bg-muted/40 min-h-screen p-4 sm:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <MonitorDetailsDisplay site={website} details={monitorDetails} timezone={timezone} />
            </div>
        </main>
    );
}
