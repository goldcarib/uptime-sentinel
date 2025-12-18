
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { upsertNotificationSettings } from "@/lib/db";
import type { NotificationSettings } from "@/lib/types";

const notificationSchema = z.object({
  email_notifications: z.enum(['on', 'off']).transform(val => val === 'on'),
  sendgrid_api_key: z.string().optional().nullable(),
  from_email: z.string().email({ message: "Please enter a valid 'From' email."}).optional().nullable().or(z.literal('')),
  to_email: z.string().email({ message: "Please enter a valid 'To' email."}).optional().nullable().or(z.literal('')),
}).refine(data => {
    if (data.email_notifications) {
        return !!data.sendgrid_api_key && !!data.from_email && !!data.to_email;
    }
    return true;
}, {
    message: "API Key, From Email, and To Email are required when notifications are enabled.",
    path: ["email_notifications"],
});

type State = {
  message?: string | null;
  errors?: {
    email_notifications?: string[];
    sendgrid_api_key?: string[];
    from_email?: string[];
    to_email?: string[];
  };
};

export async function upsertNotificationSettingsAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();

  const validatedFields = notificationSchema.safeParse({
    email_notifications: formData.get("email_notifications"),
    sendgrid_api_key: formData.get("sendgrid_api_key"),
    from_email: formData.get("from_email"),
    to_email: formData.get("to_email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  try {
    await upsertNotificationSettings(supabase, validatedFields.data as Omit<NotificationSettings, 'id' | 'user_id'>);
    revalidatePath("/settings");
    return { message: "Notification settings saved successfully." };
  } catch (e) {
    console.error(e);
    return { message: "Failed to save notification settings." };
  }
}
