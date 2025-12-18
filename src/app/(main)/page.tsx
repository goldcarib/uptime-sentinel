
import Link from 'next/link';
import {
  AlertCircle
} from "lucide-react";
import { cookies } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Incident, MonitoredSite } from "@/lib/types";
import { getWebsites, getIncidents, getNotes } from '@/lib/db';
import { MonitorsTable } from '@/components/dashboard/monitors-table';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { RecheckButton } from '@/components/dashboard/recheck-button';
import { IncidentFeed } from '@/components/dashboard/incident-feed';
import { NotesFeed } from '@/components/dashboard/notes-feed';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  // Pass the supabase client to the data fetching functions
  const sites = await getWebsites(supabase);
  const allIncidents = await getIncidents(supabase);
  const allNotes = await getNotes(supabase);
  
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3">
      <div className="grid gap-4 lg:col-span-2">
        <MonitorsTable sites={sites} />
      </div>
      
      <div className="lg:col-span-1 grid auto-rows-max gap-4">
        <IncidentFeed initialIncidents={allIncidents} />
        <NotesFeed initialNotes={allNotes} />
      </div>
    </div>
  );
}
