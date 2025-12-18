
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { getIncidentsForTeam } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const apiKey = authHeader.split(' ')[1];
    const supabaseAdmin = createSupabaseAdminClient();

    // Find the team associated with the API key
    const { data: team, error: teamError } = await supabaseAdmin
        .from('teams')
        .select('id, name')
        .eq('api_key', apiKey)
        .single();

    if (teamError || !team) {
        return new Response(JSON.stringify({ error: 'Invalid API key.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    try {
        const incidents = await getIncidentsForTeam(supabaseAdmin, team.id);
        
        const proto = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const baseUrl = `${proto}://${host}`;

        const feed = {
            version: 'https://jsonfeed.org/version/1.1',
            title: `Incidents for ${team.name} - Uptime Sentinel`,
            home_page_url: baseUrl,
            feed_url: `${baseUrl}/api/incidents/feed.json`,
            description: `A feed of the latest downtime incidents for websites monitored by the ${team.name} team.`,
            items: incidents.map(incident => ({
                id: incident.id.toString(),
                url: incident.siteUrl,
                title: `${incident.status === 'ongoing' ? '🔴' : '✅'} ${incident.siteName} is ${incident.status === 'ongoing' ? 'down' : 'resolved'}`,
                content_html: `
                    <p><strong>Website:</strong> <a href="${incident.siteUrl}">${incident.siteName}</a></p>
                    <p><strong>Status:</strong> ${incident.status}</p>
                    <p><strong>Started At:</strong> ${new Date(incident.startedAt).toUTCString()}</p>
                    ${incident.resolvedAt ? `<p><strong>Resolved At:</strong> ${new Date(incident.resolvedAt).toUTCString()}</p>`: ''}
                    ${incident.duration ? `<p><strong>Duration:</strong> ${incident.duration}</p>` : ''}
                    <p><strong>Reason:</strong> ${incident.reason || 'N/A'}</p>
                `,
                date_published: new Date(incident.startedAt).toISOString(),
                ...(incident.resolvedAt && { date_modified: new Date(incident.resolvedAt).toISOString() }),
            })),
        };

        return NextResponse.json(feed);

    } catch (error) {
        console.error("Error generating incident feed:", error);
        return new Response(JSON.stringify({ error: 'Could not generate feed.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
