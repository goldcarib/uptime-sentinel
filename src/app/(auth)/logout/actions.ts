
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout Error:", error.message);
  }
  
  revalidatePath("/", "layout");
  redirect("/login");
}
