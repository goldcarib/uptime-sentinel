
"use server";

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  slug: z.string(),
});

type State = {
    success: boolean;
    message: string;
};

export async function verifyPasswordAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = passwordSchema.safeParse({
    password: formData.get("password"),
    slug: formData.get("slug"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }
  
  const { password, slug } = validatedFields.data;
  const supabase = createSupabaseServerClient();

  const { data: page, error } = await supabase
    .from("status_pages")
    .select("password")
    .eq("slug", slug)
    .single();

  if (error || !page) {
    return { success: false, message: "Invalid status page." };
  }

  if (page.password === password) {
    cookies().set(`status-page-auth-${slug}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: `/status/${slug}`,
    });
    return { success: true, message: "Password verified." };
  }

  return { success: false, message: "Incorrect password." };
}
