
"use client"

import { useEffect, useTransition, useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { upsertNotificationSettingsAction } from "@/app/(main)/settings/notification-actions"
import { sendTestEmailAction } from "@/app/(main)/settings/test-notification-action"
import type { NotificationSettings as NotificationSettingsType } from "@/lib/types"

const notificationFormSchema = z.object({
  email_notifications: z.boolean().default(false),
  sendgrid_api_key: z.string().optional().nullable(),
  from_email: z.string().email({ message: "Please enter a valid email."}).optional().nullable().or(z.literal('')),
  to_email: z.string().email({ message: "Please enter a valid email."}).optional().nullable().or(z.literal('')),
}).refine(data => {
    if (data.email_notifications) {
        return !!data.sendgrid_api_key && !!data.from_email && !!data.to_email;
    }
    return true;
}, {
    message: "API Key, From Email, and To Email are required when notifications are enabled.",
    path: ["email_notifications"],
});


type NotificationFormValues = z.infer<typeof notificationFormSchema>

const initialSaveState = {
  message: null,
  errors: undefined,
};

export function NotificationSettings({ settings }: { settings: NotificationSettingsType }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [saveState, formAction] = useActionState(upsertNotificationSettingsAction, initialSaveState);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email_notifications: settings.email_notifications,
      sendgrid_api_key: settings.sendgrid_api_key,
      from_email: settings.from_email,
      to_email: settings.to_email,
    },
  });

  useEffect(() => {
    if (saveState.message) {
      toast({
        title: saveState.errors ? "Error" : "Settings Saved",
        description: saveState.message,
        variant: saveState.errors ? "destructive" : "default",
      });
    }
  }, [saveState, toast]);

  const handleSendTestEmail = () => {
    startTransition(async () => {
      const result = await sendTestEmailAction();
      toast({
        title: result.success ? "Test Email" : "Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure email notifications for downtime and recovery alerts using SendGrid.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email_notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Enable or disable email alerts for incidents.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      name={field.name}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="sendgrid_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SendGrid API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="SG.XXXXXXXXXXXXXXXX" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>
                    Your API key from SendGrid to send emails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="from_email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>From Email</FormLabel>
                    <FormControl>
                        <Input placeholder="sender@example.com" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormDescription>
                        The email address that sends alerts.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="to_email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>To Email</FormLabel>
                    <FormControl>
                        <Input placeholder="recipient@example.com" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormDescription>
                        The email address that receives alerts.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             {saveState?.errors?.email_notifications && <p className="text-sm font-medium text-destructive">{saveState.errors.email_notifications[0]}</p>}

          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit">Save Changes</Button>
             <Button type="button" variant="outline" onClick={handleSendTestEmail} disabled={isPending}>
              {isPending ? "Sending..." : "Send Test Email"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
