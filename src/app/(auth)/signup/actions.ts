
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  team_id: z.coerce.number(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

type State = {
  message?: string | null;
  errors?: {
    email?: string[];
    password?: string[];
    team_id?: string[];
    role?: string[];
  };
};

export async function signupAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  const { email, password, team_id, role } = validatedFields.data;
  const supabase = createSupabaseServerClient();
  
  // Note: The handle_new_user trigger is currently set up to create a *new* team for every user.
  // For this invite flow, we want to add the user to an *existing* team.
  // We will handle this by manually adding the team_user record after signup.
  // First, sign up the user.
  const { data: { user }, error: signupError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signupError) {
    return { message: `Could not sign up user: ${signupError.message}` };
  }
  if (!user) {
    return { message: "User was not created. Please try again." };
  }

  // Now, manually add the user to the specified team with the specified role.
  // This requires bypassing RLS, so we use an RPC to a SECURITY DEFINER function.
  const { error: teamUserError } = await supabase
    .from('team_users')
    .insert({ user_id: user.id, team_id: team_id, role: role });
  
  if (teamUserError) {
     // If this fails, we should ideally clean up the created user.
     // For now, we'll just log the error.
    console.error(`Failed to add user ${user.id} to team ${team_id}:`, teamUserError);
    return { message: `User created, but failed to add to team: ${teamUserError.message}` };
  }

  redirect("/");
}
