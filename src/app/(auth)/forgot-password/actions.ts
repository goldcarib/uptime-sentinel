
"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendPasswordResetNotification } from "@/lib/notifications";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type State = {
  message?: string | null;
  success: boolean;
  errors?: {
    email?: string[];
  };
};

export async function forgotPasswordAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid email address.",
    };
  }

  const supabase = createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();
  const { email } = validatedFields.data;

  // We first check if a user with that email exists.
  const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers({ email });
   if (listUsersError || users.length === 0) {
    // To prevent email enumeration attacks, we return a success message even if the user doesn't exist.
    console.warn(`Password reset attempt for non-existent email: ${email}`);
    return {
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
    };
  }
  const user = users[0];

  // Use the admin client to generate a password reset link
  const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: email,
  });

  if (linkError) {
    console.error("Error generating password reset link:", linkError);
    return {
      success: false,
      message: `Could not generate password reset link: ${linkError.message}`,
    };
  }

  const resetLink = data.properties.action_link;

  // Now, send this link using our custom email sender
  try {
     const { data: inviter } = await supabase.auth.getUser();
     await sendPasswordResetNotification({
      recipientEmail: email,
      resetLink: resetLink,
      // We need a user to fetch email settings, but it doesn't matter which one.
      // The person requesting the reset is not logged in, so we use the first admin user we can find.
      // This is a placeholder for a more robust "system-wide" notification config.
      actingUserId: inviter.user?.id ?? user.id, 
    });
  } catch (e: any) {
     return {
      success: false,
      message: `Could not send email: ${e.message}`,
    };
  }


  return {
    success: true,
    message: "If an account with this email exists, a password reset link has been sent.",
  };
}
