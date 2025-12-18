
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";
import crypto from "crypto";

const statusPageSchema = z.object({
  website_id: z.coerce.number(),
  is_public: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
  password: z.string().optional().nullable(),
  allowed_ips: z.string().optional().transform(str => 
    str ? str.split(',').map(ip => ip.trim()).filter(ip => ip) : []
  ),
});

type State = {
  success: boolean;
  message: string;
  errors?: any;
};

export async function upsertStatusPageAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();

  const validatedFields = statusPageSchema.safeParse({
    website_id: formData.get("website_id"),
    is_public: formData.get("is_public"),
    password: formData.get("password"),
    allowed_ips: formData.get("allowed_ips"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { website_id, is_public, password, allowed_ips } = validatedFields.data;

  // Check if a status page already exists for this website
  const { data: existingPage, error: findError } = await supabase
    .from('status_pages')
    .select('id, slug')
    .eq('website_id', website_id)
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error("Error finding status page:", findError);
    return { success: false, message: "Could not check for existing status page." };
  }
  
  const pageData = {
    website_id,
    is_public,
    password: password || null,
    allowed_ips: allowed_ips && allowed_ips.length > 0 ? allowed_ips : null,
    slug: existingPage?.slug ?? crypto.randomBytes(4).toString('hex'),
  };

  const { error: upsertError } = await supabase.from('status_pages').upsert(pageData, { onConflict: 'website_id' });

  if (upsertError) {
    console.error("Error upserting status page:", upsertError);
    return { success: false, message: `Failed to save status page: ${upsertError.message}` };
  }

  revalidatePath("/status-pages");
  return { success: true, message: "Status page saved successfully." };
}

export async function deleteStatusPageAction(websiteId: number) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('status_pages').delete().eq('website_id', websiteId);

    if (error) {
        console.error("Error deleting status page:", error);
        return { success: false, message: `Failed to delete status page: ${error.message}` };
    }

    revalidatePath("/status-pages");
    return { success: true, message: "Status page deleted successfully." };
}
