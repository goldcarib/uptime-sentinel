
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// This function is called by an external service (like a cron job)
export async function POST(request: Request) {
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Find all teams with Confluent enabled
    const { data: teams, error: teamsError } = await supabaseAdmin
        .from('teams')
        .select('id, confluent_rest_endpoint, confluent_api_key, confluent_api_secret')
        .eq('confluent_enabled', true)
        .not('confluent_rest_endpoint', 'is', null)
        .not('confluent_api_key', 'is', null)
        .not('confluent_api_secret', 'is', null);

    if (teamsError) {
        console.error("Confluent Job: Error fetching teams", teamsError);
        return NextResponse.json({ message: "Error fetching teams" }, { status: 500 });
    }

    if (!teams || teams.length === 0) {
        return NextResponse.json({ message: "No teams with Confluent integration enabled." });
    }

    const results = [];

    // 2. Process each team
    for (const team of teams) {
        // 3. Get recent checks for the team using the new RPC
        const { data: checks, error: checksError } = await supabaseAdmin
            .rpc('get_recent_checks_for_team', { p_team_id: team.id });
        
        if (checksError) {
            console.error(`Confluent Job: Error fetching checks for team ${team.id}`, checksError);
            results.push({ team_id: team.id, status: 'error', message: checksError.message });
            continue;
        }

        if (!checks || checks.length === 0) {
            results.push({ team_id: team.id, status: 'success', message: 'No recent checks to send.' });
            continue;
        }

        // 4. Format data for Confluent API
        const records = checks.map(check => ({
            key: { type: 'string', data: check.target_url },
            value: {
                type: 'json',
                data: {
                    timestamp_ms: check.timestamp_ms,
                    check_id: check.check_id,
                    latency_ms: check.latency_ms,
                    http_status_code: check.http_status_code,
                    error_flag: check.error_flag,
                    check_location: check.check_location,
                    host_ip_or_name: check.host_ip_or_name,
                    check_result_message: check.check_result_message,
                    tags: check.tags,
                }
            }
        }));

        const topicName = 'uptime_checks'; // As specified in the example curl
        const endpoint = `${team.confluent_rest_endpoint}/kafka/v3/clusters/`; // Cluster ID needs to be part of the endpoint from user
        
        // This is a simplified fetch. The full endpoint requires the cluster ID.
        // Assuming the user provides <REST_ENDPOINT>/kafka/v3-clusters/<CLUSTER_ID>
        const fullUrl = `${team.confluent_rest_endpoint}/topics/${topicName}/records`;

        try {
            const confluentResponse = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/vnd.kafka.json.v3+json',
                    'Authorization': 'Basic ' + btoa(`${team.confluent_api_key}:${team.confluent_api_secret}`),
                },
                body: JSON.stringify({ records }),
            });

            if (!confluentResponse.ok) {
                const errorBody = await confluentResponse.text();
                throw new Error(`Confluent API Error: ${confluentResponse.status} ${confluentResponse.statusText} - ${errorBody}`);
            }

            results.push({ team_id: team.id, status: 'success', records_sent: records.length });

        } catch (e: any) {
            console.error(`Confluent Job: Failed to send data for team ${team.id}`, e.message);
            results.push({ team_id: team.id, status: 'error', message: e.message });
        }
    }

    return NextResponse.json({ message: "Confluent job completed.", results });
}
