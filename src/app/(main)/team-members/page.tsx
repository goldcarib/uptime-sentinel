
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { TeamMembersClientPage } from "./team-members-client-page";
import { getTeamsForUser } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Team, AppRole, TeamUser } from "@/lib/types";
import { getTeamMembersWithEmails } from "./actions";

export const dynamic = 'force-dynamic';

export default async function TeamMembersPage() {
    const supabase = createSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/login");
    }
    
    const teams = await getTeamsForUser(supabase);
    const adminTeams = teams.filter((team: Team & { role: AppRole }) => team.role === 'ADMIN');

    if (adminTeams.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">You do not have permission to manage any teams.</p>
            </div>
        )
    }

    const initialTeam = adminTeams[0];
    let initialMembers: TeamUser[] = [];
    try {
        if (initialTeam) {
            initialMembers = await getTeamMembersWithEmails(initialTeam.id);
        }
    } catch (e: any) {
        // The page can still render, and the client will show an error.
        console.error("Failed to load initial members:", e.message);
    }


    return <TeamMembersClientPage teams={adminTeams} initialMembers={initialMembers} currentUserId={user.id} />;
}
