
"use server";

import sgMail from "@sendgrid/mail";
import { getNotificationSettingsForUser } from "@/lib/db";
import type { MonitoredSite, Incident } from "./types";
import { createSupabaseAdminClient } from "./supabase-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type SendStatusNotificationArgs = {
  site: MonitoredSite;
  incident: Incident;
  type: 'down' | 'up';
};

type SendInviteNotificationArgs = {
  teamName: string;
  recipientEmail: string;
  inviteLink: string;
  inviterId: string;
};

type SendPasswordResetArgs = {
  recipientEmail: string;
  resetLink: string;
  actingUserId: string;
};


const getEmailHtml = (
  type: 'down' | 'up' | 'invite' | 'password-reset',
  details: any
): string => {
  const cardBackgroundColor = '#ffffff';
  const cardBorder = '1px solid #e0e0e0';
  const mainBackgroundColor = '#f7f7f7';
  const textColor = '#333333';

  let headerText = '';
  let headerColor = '';
  let body = '';

  if (type === 'down' || type === 'up') {
    const { site, incident } = details as SendStatusNotificationArgs;
    headerText = type === 'down' ? `🔴 Alert: ${site.name} is Down` : `✅ Resolved: ${site.name} is Back Up`;
    headerColor = type === 'down' ? '#d9534f' : '#5cb85c';
    body = type === 'down'
      ? `
        <p>This is an automated alert to inform you that your website, <strong>${site.name}</strong>, is currently down.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
          <tr><td style="padding-right: 8px;"><strong>URL:</strong></td><td><a href="${site.url}">${site.url}</a></td></tr>
          <tr><td style="padding-right: 8px;"><strong>Reason:</strong></td><td>${incident.reason || 'N/A'}</td></tr>
          <tr><td style="padding-right: 8px;"><strong>Time:</strong></td><td>${new Date(incident.startedAt).toLocaleString()}</td></tr>
        </table>
        <p>We are monitoring the situation and will notify you as soon as the site is back online.</p>
      `
      : `
        <p>Good news! Your website, <strong>${site.name}</strong>, is back online and operational.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
           <tr><td style="padding-right: 8px;"><strong>URL:</strong></td><td><a href="${site.url}">${site.url}</a></td></tr>
           <tr><td style="padding-right: 8px;"><strong>Resolved At:</strong></td><td>${incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'N/A'}</td></tr>
        </table>
        <p>The incident has been resolved.</p>
      `;
  } else if (type === 'invite') {
      const { teamName, inviteLink } = details as SendInviteNotificationArgs;
      headerText = `You're invited to join ${teamName}`;
      headerColor = '#2d6cdf'; // A neutral, inviting blue
      body = `
        <p>You have been invited to join the <strong>${teamName}</strong> team on Uptime Sentinel.</p>
        <p>Click the button below to accept the invitation and create your account. This link is valid for 24 hours.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
            <tr>
                <td align="center">
                    <a href="${inviteLink}" target="_blank" style="background-color: #2d6cdf; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
                </td>
            </tr>
        </table>
        <p style="font-size: 12px; color: #888888;">If you cannot click the button, copy and paste this link into your browser:<br/><a href="${inviteLink}" style="color: #555555;">${inviteLink}</a></p>
      `;
  } else if (type === 'password-reset') {
      const { resetLink } = details as SendPasswordResetArgs;
      headerText = `Reset Your Password`;
      headerColor = '#2d6cdf';
      body = `
        <p>You requested a password reset for your Uptime Sentinel account.</p>
        <p>Click the button below to set a new password. For your security, this link will expire in one hour.</p>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
            <tr>
                <td align="center">
                    <a href="${resetLink}" target="_blank" style="background-color: #2d6cdf; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </td>
            </tr>
        </table>
        <p style="font-size: 12px; color: #888888;">If you did not request this, please ignore this email. If you cannot click the button, copy and paste this link into your browser:<br/><a href="${resetLink}" style="color: #555555;">${resetLink}</a></p>
      `;
  }


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${mainBackgroundColor}; color: ${textColor};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${cardBackgroundColor}; border-radius: 8px; border: ${cardBorder};">
              <tr>
                <td style="padding: 20px; text-align: center; background-color: ${headerColor}; color: white; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                  <h1 style="margin: 0; font-size: 24px;">${headerText}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px; line-height: 1.6;">
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="padding: 16px; text-align: center; font-size: 12px; color: #888888; border-top: ${cardBorder};">
                  <p style="margin:0;">Uptime Sentinel</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};


export async function sendStatusNotification({ site, incident, type }: SendStatusNotificationArgs): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!site.user_id) {
    console.error(`Site ${site.id} does not have a user_id, cannot send notification.`);
    return;
  }
  
  const settings = await getNotificationSettingsForUser(supabaseAdmin, site.user_id);

  if (!settings || !settings.email_notifications || !settings.sendgrid_api_key || !settings.from_email) {
    console.log(`Email notifications are not configured for user ${site.user_id}. Skipping.`);
    return;
  }

  const recipients = site.notification_emails && site.notification_emails.length > 0
    ? site.notification_emails
    : settings.to_email ? [settings.to_email] : [];

  if (recipients.length === 0) {
    console.log(`No recipient emails found for user ${site.user_id}. Skipping.`);
    return;
  }

  sgMail.setApiKey(settings.sendgrid_api_key);

  const subject = type === 'down'
    ? `🔴 Uptime Alert: ${site.name} is down`
    : `✅ Uptime Alert: ${site.name} is back up`;
  
  const html = getEmailHtml(type, { site, incident });

  const messages = recipients.map(recipient => ({
    to: recipient,
    from: {
      email: settings.from_email!,
      name: "Uptime Sentinel",
    },
    subject,
    html: html,
  }));

  try {
    await sgMail.send(messages);
    console.log(`Status notification sent successfully to ${recipients.join(', ')}.`);
  } catch (error: any) {
    console.error("Failed to send status notification email via SendGrid:", error.message);
    throw new Error(error.message);
  }
}

export async function sendInviteNotification({ teamName, recipientEmail, inviteLink, inviterId }: SendInviteNotificationArgs): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();

  if (!inviterId) {
    throw new Error("Could not determine the inviting user.");
  }
  
  // Use the inviter's notification settings to send the email
  const settings = await getNotificationSettingsForUser(supabaseAdmin, inviterId);

  if (!settings || !settings.email_notifications || !settings.sendgrid_api_key || !settings.from_email) {
    throw new Error(`The inviting user has not configured their email notification settings.`);
  }
  
  sgMail.setApiKey(settings.sendgrid_api_key);

  const subject = `You've been invited to join ${teamName} on Uptime Sentinel`;
  const html = getEmailHtml('invite', { teamName, inviteLink });

  const msg = {
    to: recipientEmail,
    from: {
      email: settings.from_email,
      name: `Uptime Sentinel (${teamName})`
    },
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    console.log(`Invite notification sent successfully to ${recipientEmail}.`);
  } catch (error: any) {
    console.error("Failed to send invite notification email via SendGrid:", error.message);
    throw new Error(error.message);
  }
}

export async function sendPasswordResetNotification({ recipientEmail, resetLink, actingUserId }: SendPasswordResetArgs): Promise<void> {
    const supabaseAdmin = createSupabaseAdminClient();

    let apiKey = process.env.SENDGRID_API_KEY;
    let fromEmail = process.env.SENDGRID_FROM_EMAIL;

    // If environment variables aren't set, fall back to user settings
    if (!apiKey || !fromEmail) {
        console.log("System-wide SendGrid ENV VARS not set, falling back to user settings for password reset.");
        const settings = await getNotificationSettingsForUser(supabaseAdmin, actingUserId);

        if (!settings || !settings.email_notifications || !settings.sendgrid_api_key || !settings.from_email) {
            throw new Error("The application's email notification settings are not configured. Cannot send password reset email.");
        }
        apiKey = settings.sendgrid_api_key;
        fromEmail = settings.from_email;
    }
    
    sgMail.setApiKey(apiKey);

    const subject = "Reset your Uptime Sentinel password";
    const html = getEmailHtml('password-reset', { resetLink });

    const msg = {
        to: recipientEmail,
        from: {
            email: fromEmail,
            name: "Uptime Sentinel"
        },
        subject,
        html
    };

    try {
        await sgMail.send(msg);
        console.log(`Password reset email sent successfully to ${recipientEmail}.`);
    } catch (error: any) {
        console.error("Failed to send password reset email via SendGrid:", error.message);
        throw new Error(error.message);
    }
}
