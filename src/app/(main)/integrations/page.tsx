import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getTeamsForUser } from "@/lib/db";
import { IntegrationsClientPage } from "./integrations-client-page";
import type { Team } from "@/lib/types";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const allTeams = await getTeamsForUser(supabase);

  // The dialog only needs to configure teams where the user is an admin
  const adminTeams = allTeams.filter(team => team.role === 'ADMIN');

  return <IntegrationsClientPage teams={adminTeams} />;
}
