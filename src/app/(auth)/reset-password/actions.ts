
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });


type State = {
  message?: string | null;
  success: boolean;
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    token?: string[];
  };
};

export async function resetPasswordAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  const supabase = createSupabaseServerClient();
  const { password } = validatedFields.data;

  // The user should have a session with an access_token from the password reset link
  // This happens automatically when they click the link from the email.
  // We just need to update the user's password.
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      success: false,
      message: `Could not reset password: ${error.message}`,
    };
  }

  // The password has been updated. We should sign the user out
  // to force them to log in with their new password.
  await supabase.auth.signOut();
  
  // This redirect is for the server action result. The client-side will also redirect.
  // Using redirect here ensures the flow completes even if JS is disabled.
  redirect("/login");

  // This part is less likely to be reached due to the redirect, but it's good practice.
  return {
    success: true,
    message: "Your password has been reset successfully. Please log in with your new password.",
  };
}
