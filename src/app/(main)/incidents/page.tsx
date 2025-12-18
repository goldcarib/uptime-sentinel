
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getIncidents } from "@/lib/db";
import { IncidentsClientPage } from "./incidents-client-page";

export const dynamic = 'force-dynamic';

export default async function IncidentsPage() {
  const supabase = createSupabaseServerClient();
  const incidents = await getIncidents(supabase);

  return <IncidentsClientPage initialIncidents={incidents} />;
}
