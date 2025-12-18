
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type State = {
  message?: string | null;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const supabase = createSupabaseServerClient();

  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  const { email, password } = validatedFields.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: "Could not authenticate user. Please check your credentials." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
