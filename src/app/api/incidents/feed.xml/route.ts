import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { getIncidentsForTeam } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
        return new Response(`<error>Missing API key in query parameter (e.g., ?api_key=your_token).</error>`, {
            status: 401,
            headers: { 'Content-Type': 'application/xml' },
        });
    }
    const supabaseAdmin = createSupabaseAdminClient();

    const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .select('id, name')
        .eq('api_key', apiKey)
        .single();

    if (teamError || !team) {
        return new Response(`<error>Invalid API key.</error>`, {
            status: 403,
            headers: { 'Content-Type': 'application/xml' },
        });
    }

    try {
        const incidents = await getIncidentsForTeam(supabaseAdmin, team.id);

        const proto = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const baseUrl = `${proto}://${host}`;        
        const feedUrl = `${baseUrl}/api/incidents/feed.xml`;

        // Build each <item>
        const xmlItems = incidents.map(incident => `
            <item>
                <title>${incident.status === 'ongoing' ? '🔴' : '✅'} ${incident.siteName} is ${incident.status === 'ongoing' ? 'down' : 'resolved'}</title>
                <link>${incident.siteUrl}</link>
                <guid isPermaLink="false">${incident.id}</guid>

                <pubDate>${new Date(incident.startedAt).toUTCString()}</pubDate>

                <description><![CDATA[
                    <p><strong>Website:</strong> <a href="${incident.siteUrl}">${incident.siteName}</a></p>
                    <p><strong>Status:</strong> ${incident.status}</p>
                    <p><strong>Started At:</strong> ${new Date(incident.startedAt).toUTCString()}</p>
                    ${incident.resolvedAt ? `<p><strong>Resolved At:</strong> ${new Date(incident.resolvedAt).toUTCString()}</p>` : ''}
                    ${incident.duration ? `<p><strong>Duration:</strong> ${incident.duration}</p>` : ''}
                    <p><strong>Reason:</strong> ${incident.reason || 'N/A'}</p>
                ]]></description>
            </item>
        `).join('');

        // Wrap in full RSS feed
        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Incidents for ${team.name} - Uptime Sentinel</title>
        <link>${baseUrl}</link>
        
        <description>
            A feed of the latest downtime incidents for websites monitored by the ${team.name} team.
        </description>

        <atom:link 
            href="${feedUrl}" 
            rel="self" 
            type="application/rss+xml" 
        />

        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

        ${xmlItems}
    </channel>
</rss>`;

        return new Response(rss, {
            status: 200,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });

    } catch (error) {
        console.error("Error generating incident feed:", error);
        return new Response(`<error>Could not generate feed.</error>`, {
            status: 500,
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}
