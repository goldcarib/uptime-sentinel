

import type { SupabaseClient } from '@supabase/js';
import type { MonitoredSite, NotificationSettings, Incident, AppRole, TeamUser, Team, Note } from "./types";
import { addMinutes, isBefore, subDays } from "date-fns";


export async function getWebsites(supabase: SupabaseClient): Promise<MonitoredSite[]> {
    const { data: { session }} = await supabase.auth.getSession();

    if (!session) {
        return [];
    }

    // RLS will ensure we only get websites for the user's teams.
    const { data: websites, error } = await supabase.from('websites').select('*');

    if (error) {
        console.error("Error fetching websites:", error.message);
        throw new Error(error.message);
    }
    
    if (!websites || websites.length === 0) {
        return [];
    }
    
    const siteIds = websites.map(site => site.id);
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('website_id, started_at, resolved_at')
        .in('website_id', siteIds)
        .gte('started_at', thirtyDaysAgo);

    if (incidentsError) {
        console.error("Error fetching incidents:", incidentsError.message);
        throw new Error(incidentsError.message);
    }

    const { data: checks, error: checksError } = await supabase
        .from('checks')
        .select('website_id, response_time, status')
        .in('website_id', siteIds)
        .gte('created_at', thirtyDaysAgo);

    if (checksError) {
        console.error("Error fetching checks:", checksError.message);
        throw new Error(checksError.message);
    }

    const sitesWithStats = websites.map(site => {
        const siteIncidents = incidents.filter(i => i.website_id === site.id);
        const totalDowntimeSeconds = siteIncidents.reduce((total, incident) => {
            const startTime = new Date(incident.started_at);
            const endTime = incident.resolved_at ? new Date(incident.resolved_at) : new Date();
            return total + (endTime.getTime() - startTime.getTime()) / 1000;
        }, 0);

        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        const uptimePercentage = Math.max(0, (thirtyDaysInSeconds - totalDowntimeSeconds) / thirtyDaysInSeconds * 100);
        
        const siteChecks = checks.filter(c => c.website_id === site.id && c.status === 'up');
        const avgResponseTime = siteChecks.length > 0
            ? siteChecks.reduce((acc, c) => acc + c.response_time, 0) / siteChecks.length
            : 0;

        return {
            ...site,
            lastChecked: site.last_checked,
            uptime: uptimePercentage.toFixed(2),
            avgResponseTime: Math.round(avgResponseTime)
        };
    });

    return sitesWithStats;
}

export async function addWebsite(supabase: SupabaseClient, data: Omit<MonitoredSite, 'id' | 'status' | 'uptime' | 'avgResponseTime' | 'lastChecked'>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }
    const { error } = await supabase.from('websites').insert([{ ...data, user_id: user.id }]);

    if (error) {
        console.error("Error adding website:", error);
        throw new Error(`Failed to add website: ${error.message}`);
    }
}

export async function updateWebsite(supabase: SupabaseClient, id: number, team_id: number, data: Partial<Omit<MonitoredSite, 'id'>>) {
    const { error } = await supabase
        .from('websites')
        .update(data)
        .eq('id', id)
        .eq('team_id', team_id); // RLS also checks this, but explicit check is good practice

    if (error) {
        console.error("Error updating website:", error);
        throw new Error(`Failed to update website: ${error.message}`);
    }
}

export async function deleteWebsite(supabase: SupabaseClient, id: number) {
    const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting website:", error);
        throw new Error(`Failed to delete website: ${error.message}`);
    }
}


export async function recordCheck(supabase: SupabaseClient, websiteId: number, status: 'up' | 'down', responseTime: number, reason?: string | null, location?: string | null, host?: string | null) {
    const { error } = await supabase.from('checks').insert({
        website_id: websiteId,
        status: status,
        response_time: responseTime,
        reason,
        location,
        host
    });
    if (error) {
        console.error(`Failed to record check for website ${websiteId}:`, error.message);
    }
}


export async function setWebsiteStatus(supabase: SupabaseClient, id: number, status: 'up' | 'down', lastChecked: string) {
    const { error } = await supabase
        .from('websites')
        .update({ status: status, last_checked: lastChecked })
        .eq('id', id);

    if (error) {
        console.error(`Could not update website status for id: ${id}`);
    }
}


export async function createIncident(supabase: SupabaseClient, websiteId: number, reason: string): Promise<Incident | null> {
    const { data, error } = await supabase.from('incidents').insert([
        { website_id: websiteId, reason: reason, status: 'ongoing' }
    ]).select().single();
    if (error) {
        console.error("Error creating incident:", error.message);
        return null;
    }
    return { ...data, startedAt: data.created_at } as Incident;
}

export async function resolveIncident(supabase: SupabaseClient, websiteId: number): Promise<Incident[] | null> {
    const { data: ongoingIncidents, error: findError } = await supabase
        .from('incidents')
        .select('id')
        .eq('website_id', websiteId)
        .eq('status', 'ongoing');

    if (findError) {
        console.error(`Error finding ongoing incidents for website ${websiteId}:`, findError.message);
        return null;
    }

    if (!ongoingIncidents || ongoingIncidents.length === 0) {
        return null;
    }

    const incidentIds = ongoingIncidents.map(i => i.id);

    const { data: updatedIncidents, error: updateError } = await supabase
        .from('incidents')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .in('id', incidentIds)
        .select();
    
    if (updateError) {
        console.error(`Error resolving incidents for website ${websiteId}:`, updateError.message);
        return null;
    }

    return updatedIncidents.map(i => ({...i, startedAt: i.created_at, resolvedAt: i.resolved_at} as Incident));
}


export async function getNotificationSettings(supabase: SupabaseClient): Promise<NotificationSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Error fetching notification settings:", error);
        return null;
    }

    return data;
}

export async function getNotificationSettingsForUser(supabase: SupabaseClient, userId: string): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
        .from('notification_settings')
        .select('*'
        )
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
         console.error(`Error fetching timezone for user ${userId}:`, error);
    }
    return data;
}


export async function upsertNotificationSettings(supabase: SupabaseClient, settings: Partial<Omit<NotificationSettings, 'id' | 'user_id'>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
        .from('notification_settings')
        .upsert({ ...settings, user_id: user.id }, { onConflict: 'user_id' });
    
    if (error) throw new Error(`Could not save notification settings: ${error.message}`);
}

export async function getIncidents(supabase: SupabaseClient): Promise<Incident[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    // RLS on the view handles security
    const { data, error } = await supabase
        .from('incidents_with_details')
        .select('*')
        .order('started_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching incidents:", error);
        throw new Error(error.message);
    }

    return data.map(i => ({
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
}

export async function getIncidentsForTeam(supabase: SupabaseClient, teamId: number): Promise<Incident[]> {
     const { data, error } = await supabase
        .from('incidents_with_details')
        .select('*')
        .eq('team_id', teamId)
        .order('started_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching incidents for team:", error);
        throw new Error(error.message);
    }
     return data.map(i => ({
        ...i,
        id: i.id,
        website_id: i.website_id,
        siteName: i.site_name,
        siteUrl: i.site_url,
        startedAt: i.started_at,
        resolvedAt: i.resolved_at,
        duration: i.duration,
        reason: i.reason,
    }));
}


export async function getTeamMembers(supabase: SupabaseClient, teamId: number): Promise<TeamUser[]> {
    const { data, error } = await supabase
        .from('team_users')
        .select('user_id, role')
        .eq('team_id', teamId);
    
    if (error) {
        console.error(`Error fetching team members for team ${teamId}:`, error);
        return [];
    }
    
    // We can't get emails on the client with RLS, so this will be handled separately if needed
    // For now, we will return what we can get.
    return data.map(member => ({
        ...member,
        email: 'Visible to Admins' // Placeholder
    }));
}

export async function getTeamsForUser(supabase: SupabaseClient): Promise<(Team & { role: AppRole })[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
        const { data: teamUsers, error: teamUsersError } = await supabase
            .from('team_users')
            .select('team_id, role')
            .eq('user_id', user.id);

        if (teamUsersError) throw teamUsersError;
        if (!teamUsers || teamUsers.length === 0) return [];

        const teamIds = teamUsers.map(tu => tu.team_id);
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds);
        
        if (teamsError) throw teamsError;

        const teamsWithRoles = teams.map(team => {
            const userRole = teamUsers.find(tu => tu.team_id === team.id)?.role;
            return {
                ...team,
                role: userRole || 'MEMBER', // Default to member if role not found, though it should be.
            };
        });

        return teamsWithRoles;

    } catch (error) {
        console.error('Error fetching teams for user:', error);
        return []; // Return empty array on error to prevent crashes
    }
}


export async function getNotes(supabase: SupabaseClient): Promise<Note[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    // RLS will ensure we only see notes for our teams
    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching notes:", error);
        throw new Error(error.message);
    }
    
    return data;
}

export async function getNoteById(supabase: SupabaseClient, id: number): Promise<(Note & {author_email: string}) | null> {
    // RLS on 'notes' ensures the user can only fetch notes from their teams.
    const { data: note, error: noteError } = await supabase
        .from('notes')
        .select(`*`)
        .eq('id', id)
        .single();
    
    if (noteError || !note) {
        console.error(`Error fetching note by id ${id}:`, noteError);
        return null;
    }

    // Since RLS on auth.users is complex, we use an RPC function
    // to securely get the email of the author. This function should be defined
    // in your Supabase SQL editor with `SECURITY DEFINER`.
    const { data: email, error: emailError } = await supabase.rpc('get_user_email_by_id', { p_user_id: note.user_id });
    
    if (emailError) {
        console.error(`Error fetching author email for user ${note.user_id}:`, emailError);
        // We can still return the note, just with an unknown author.
    }
    
    return {
        ...note,
        author_email: email || 'Unknown User'
    };
}
