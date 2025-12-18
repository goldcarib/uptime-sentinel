
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { TeamUser } from "@/lib/types";
import { sendInviteNotification } from "@/lib/notifications";


// This function now uses the Admin client to securely fetch member emails.
// It must first verify that the calling user is an admin of the requested team.
export async function getTeamMembersWithEmails(teamId: number): Promise<TeamUser[]> {
    const supabase = createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    // 2. Verify the current user is an admin of the requested team
    const { data: adminCheck, error: adminCheckError } = await supabase
        .from('team_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .single();

    if (adminCheckError || adminCheck?.role !== 'ADMIN') {
        console.error(`Security check failed: User ${user.id} is not an admin for team ${teamId}.`);
        throw new Error("You do not have permission to view this team's members.");
    }
    
    try {
        // 3. Get all user_ids and roles for the team
        const { data: teamUsersData, error: teamUsersError } = await supabaseAdmin
            .from('team_users')
            .select('user_id, role')
            .eq('team_id', teamId);
        
        if (teamUsersError) throw teamUsersError;
        if (!teamUsersData) return [];

        // 4. Get the user details (including email) for all those user_ids
        const userIds = teamUsersData.map(tu => tu.user_id);
        const { data: { users: authUsers }, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000, // Adjust as needed, max is 1000
        });

        if (authUsersError) throw authUsersError;

        // Filter the full user list to only include members of this team
        const teamAuthUsers = authUsers.filter(u => userIds.includes(u.id));

        // 5. Map the results together
        const members = teamUsersData.map(teamUser => {
            const authUser = teamAuthUsers.find(au => au.id === teamUser.user_id);
            return {
                user_id: teamUser.user_id,
                role: teamUser.role,
                email: authUser?.email || 'Could not retrieve email',
            };
        });

        return members;

    } catch (error: any) {
        console.error(`Error fetching team members for team ${teamId}:`, error);
        // Return an empty array on failure to prevent crashing the client
        return [];
    }
}


const inviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(["ADMIN", "MEMBER"], { message: "Please select a valid role." }),
  team_id: z.coerce.number(),
  team_name: z.string(),
});

type State = {
  message?: string | null;
  error?: boolean;
  errors?: {
    email?: string[];
    role?: string[];
    team_id?: string[];
  };
};

export async function inviteMemberAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    team_id: formData.get("team_id"),
    team_name: formData.get("team_name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
      error: true,
    };
  }
  
  const supabase = createSupabaseServerClient();
  const { data: { user: inviter } } = await supabase.auth.getUser();

  if (!inviter) {
    return { message: "You must be logged in to invite members.", error: true };
  }

  const { email, role, team_id, team_name } = validatedFields.data;
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ email });
   if (usersError) {
    console.error("Error checking for existing user:", usersError);
    return { message: "Could not verify user existence.", error: true };
  }

  const existingUser = users.length > 0 ? users[0] : null;

  if (existingUser) {
    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from('team_users')
      .select('user_id')
      .eq('user_id', existingUser.id)
      .eq('team_id', team_id)
      .maybeSingle();

    if (membershipError) {
      console.error("Error checking team membership:", membershipError);
      return { message: "Database error when checking team membership.", error: true };
    }

    if (existingMembership) {
      return { message: "This user is already a member of this team.", error: true };
    }
  }
  
  const redirectUrl = new URL('/signup', process.env.NEXT_PUBLIC_BASE_URL);
  redirectUrl.searchParams.set('email', email);
  redirectUrl.searchParams.set('team_id', team_id.toString());
  redirectUrl.searchParams.set('role', role);

  try {
     await sendInviteNotification({
      teamName: team_name,
      recipientEmail: email,
      inviteLink: redirectUrl.toString(),
      inviterId: inviter.id
    });
  } catch (e: any) {
     return { message: `Could not send email invitation: ${e.message}`, error: true };
  }
  
  revalidatePath("/team-members");
  return { message: `Invitation sent successfully to ${email}. The user needs to click the link in the email to complete the sign up.` };
}


export async function removeMemberAction(userId: string, teamId: number) {
    if (!userId || !teamId) {
        return { message: "User ID and Team ID are required.", error: true };
    }
    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
        .from('team_users')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId);

    if (error) {
        console.error("Remove Member Error:", error.message);
        return { message: `Failed to remove member: ${error.message}`, error: true };
    }

    revalidatePath('/team-members');
    return { message: "Team member removed successfully." };
}
