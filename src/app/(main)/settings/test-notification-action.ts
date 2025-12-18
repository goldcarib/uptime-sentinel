
"use server";

import sgMail from "@sendgrid/mail";
import { cookies } from "next/headers";
import { getNotificationSettings } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type State = {
  message: string;
  success: boolean;
};

export async function sendTestEmailAction(): Promise<State> {
  const supabase = createSupabaseServerClient();
  const settings = await getNotificationSettings(supabase);

  if (!settings || !settings.email_notifications) {
    return { success: false, message: "Email notifications are not enabled." };
  }

  if (!settings.sendgrid_api_key || !settings.to_email || !settings.from_email) {
    return { success: false, message: "Missing required SendGrid settings (API Key, To/From Email)." };
  }

  sgMail.setApiKey(settings.sendgrid_api_key);

  const msg = {
    to: settings.to_email,
    from: {
      email: settings.from_email,
      name: "Uptime Sentinel",
    },
    subject: "Test Notification from Uptime Sentinel",
    text: "This is a test notification to confirm your email settings are working correctly.",
    html: "<strong>This is a test notification to confirm your email settings are working correctly.</strong>",
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: `Test email sent successfully to ${settings.to_email}.` };
  } catch (error: any) {
    console.error("SendGrid Error:", error.message);
    return { success: false, message: "Failed to send test email. Check your SendGrid credentials." };
  }
}
