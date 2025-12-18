
import { cookies } from "next/headers";
import { getWebsites, getNotificationSettings, getTeamsForUser } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WebsiteSettings } from "@/components/settings/website-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { ApiKeySettings } from "@/components/settings/api-keys-settings"
import type { NotificationSettings as NotificationSettingsType, Team } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function SettingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createSupabaseServerClient();
  const websites = await getWebsites(supabase);
  const notificationSettings = await getNotificationSettings(supabase);
  const { data: { user } } = await supabase.auth.getUser();
  const teams = await getTeamsForUser(supabase);

  // Filter for teams where the user is an admin
  const adminTeams = teams.filter(team => team.role === 'ADMIN');

  const defaultSettings: NotificationSettingsType = {
    email_notifications: false,
    sendgrid_api_key: '',
    from_email: '',
    to_email: '',
    ...notificationSettings,
  }
  
  const defaultTab = searchParams.tab || "websites";

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Settings</h3>
            <p className="text-sm text-muted-foreground">
                Manage your account and application settings.
            </p>
        </div>
        <Tabs defaultValue={defaultTab} className="space-y-4">
            <TabsList>
                <TabsTrigger value="websites">Websites</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="keys">API Keys</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="websites" className="space-y-4">
                <WebsiteSettings sites={websites} teams={adminTeams} />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
                <NotificationSettings settings={defaultSettings} />
            </TabsContent>
             <TabsContent value="keys" className="space-y-4">
                <ApiKeySettings teams={adminTeams} />
            </TabsContent>
            <TabsContent value="profile" className="space-y-4">
              {user && <ProfileSettings user={user} />}
            </TabsContent>
        </Tabs>
    </div>
  )
}
