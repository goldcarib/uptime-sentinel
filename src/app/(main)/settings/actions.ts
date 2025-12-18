
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { addWebsite, deleteWebsite, updateWebsite } from "@/lib/db";
import { upsertNotificationSettings } from "@/lib/db";

const websiteSchema = z.object({
  team_id: z.coerce.number(),
  name: z.string().min(1, { message: "Name is required." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  check_interval: z.coerce.number().min(1, { message: "Interval must be at least 1." }),
  notification_emails: z.string().optional().transform(str => 
    str ? str.split(',').map(email => email.trim()).filter(email => email) : []
  ).refine(emails => 
    emails.every(email => z.string().email().safeParse(email).success), 
    { message: "Please provide a valid, comma-separated list of emails." }
  ),
  ignore_ssl: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
});

type State = {
  message?: string | null;
  errors?: {
    name?: string[];
    url?: string[];
    check_interval?: string[];
    notification_emails?: string[];
    ignore_ssl?: string[];
    email?: string[];
    password?: string[];
    newPassword?: string[];
    team_id?: string[];
    timezone?: string[];
    confluent_enabled?: string[];
    elevenlabs_api_key?: string[];
    elevenlabs_voice_id?: string[];
  };
};

export async function addWebsiteAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();
  
  const validatedFields = websiteSchema.safeParse({
    team_id: formData.get("team_id"),
    name: formData.get("name"),
    url: formData.get("url"),
    check_interval: formData.get("check_interval"),
    notification_emails: formData.get("notification_emails"),
    ignore_ssl: formData.get("ignore_ssl"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  try {
    // @ts-ignore
    await addWebsite(supabase, validatedFields.data);
    revalidatePath("/settings");
    revalidatePath("/");
    return { message: "Website added successfully." };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to add website: ${e.message}` };
  }
}

export async function updateWebsiteAction(id: number, prevState: State, formData: FormData): Promise<State> {
    const supabase = createSupabaseServerClient();

   const validatedFields = websiteSchema.safeParse({
    team_id: formData.get("team_id"),
    name: formData.get("name"),
    url: formData.get("url"),
    check_interval: formData.get("check_interval"),
    notification_emails: formData.get("notification_emails"),
    ignore_ssl: formData.get("ignore_ssl"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  try {
    await updateWebsite(supabase, id, validatedFields.data.team_id, validatedFields.data);
    revalidatePath("/settings");
    revalidatePath("/");
    return { message: "Website updated successfully." };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to update website: ${e.message}` };
  }
}

export async function deleteWebsiteAction(id: number) {
    const supabase = createSupabaseServerClient();

    if (!id) {
        return { message: "ID is required to delete."};
    }
  try {
    await deleteWebsite(supabase, id);
    revalidatePath("/settings");
    revalidatePath("/");
    return { message: "Website deleted successfully." };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to delete website: ${e.message}` };
  }
}

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export async function updateEmailAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();

  const validatedFields = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  const { email } = validatedFields.data;
  const { error } = await supabase.auth.updateUser({ email });

  if (error) {
    return { message: `Could not update email: ${error.message}` };
  }

  return { message: "A confirmation link has been sent to both your old and new email addresses." };
}

const passwordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

export async function updatePasswordAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();

  const validatedFields = passwordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: { newPassword: validatedFields.error.flatten().fieldErrors.password },
      message: "Invalid form data.",
    };
  }

  const { password } = validatedFields.data;
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { message: `Could not update password: ${error.message}` };
  }
  
  return { message: "Password updated successfully." };
}

const timezoneSchema = z.object({
  timezone: z.string().min(1, "Timezone is required."),
});

export async function updateTimezoneAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to update your timezone.", errors: {} };
  }

  const validatedFields = timezoneSchema.safeParse({
    timezone: formData.get("timezone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  try {
    await upsertNotificationSettings(supabase, { timezone: validatedFields.data.timezone });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { message: "Timezone updated successfully. The page will now reload." };
  } catch(e: any) {
    return { message: `Failed to update timezone: ${e.message}`, errors: {} };
  }
}


export async function regenerateApiKeyAction(teamId: number): Promise<{ success: boolean; message: string; newKey?: string }> {
    const supabase = createSupabaseServerClient();
    const { data: newKey, error } = await supabase.rpc('regenerate_api_key', { p_team_id: teamId });

    if (error) {
        console.error("API Key Regeneration Error:", error);
        return { success: false, message: `Failed to regenerate API key: ${error.message}` };
    }
    
    revalidatePath('/settings');
    return { success: true, message: "API key regenerated successfully.", newKey: newKey as string };
}


const confluentFormSchema = z.object({
  team_id: z.coerce.number(),
  confluent_enabled: z.preprocess((val) => val === 'on' || val === true, z.boolean()).default(false),
  confluent_rest_endpoint: z.string().optional().nullable(),
  confluent_api_key: z.string().optional().nullable(),
  confluent_api_secret: z.string().optional().nullable(),
}).refine(data => {
    if (data.confluent_enabled) {
        return !!data.confluent_rest_endpoint && !!data.confluent_api_key && !!data.confluent_api_secret;
    }
    return true;
}, {
    message: "Endpoint, API Key, and Secret are required when Confluent is enabled.",
    path: ["confluent_enabled"],
});


export async function updateConfluentSettingsAction(prevState: State, formData: FormData): Promise<State> {
    const supabase = createSupabaseServerClient();
    const validatedFields = confluentFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid form data.",
        };
    }

    const { team_id, ...settings } = validatedFields.data;

    try {
        const { error } = await supabase
            .from('teams')
            .update(settings)
            .eq('id', team_id);
        if (error) throw error;
        revalidatePath('/settings');
        return { message: 'Confluent settings updated successfully.' };
    } catch (e: any) {
        return { message: `Failed to update settings: ${e.message}` };
    }
}

const elevenLabsFormSchema = z.object({
  team_id: z.coerce.number(),
  elevenlabs_api_key: z.string().optional().nullable(),
  elevenlabs_voice_id: z.string().optional().nullable(),
});

export async function updateElevenLabsSettingsAction(prevState: State, formData: FormData): Promise<State> {
    const supabase = createSupabaseServerClient();
    const validatedFields = elevenLabsFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Invalid form data.",
        };
    }

    const { team_id, ...settings } = validatedFields.data;

    try {
        const { error } = await supabase
            .from('teams')
            .update(settings)
            .eq('id', team_id);
        if (error) throw error;
        revalidatePath('/settings');
        return { message: 'ElevenLabs settings updated successfully.' };
    } catch (e: any) {
        return { message: `Failed to update settings: ${e.message}` };
    }
}
