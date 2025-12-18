
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { StatusPagesClient } from "./status-pages-client";
import type { WebsiteWithStatusPage } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

async function getWebsitesWithStatusPages(supabase: SupabaseClient): Promise<WebsiteWithStatusPage[]> {
  const { data, error } = await supabase
    .from('websites')
    .select(`
      *,
      status_pages (*)
    `);

  if (error) {
    console.error("Error fetching websites with status pages:", error);
    throw new Error(error.message);
  }

  return data.map(item => ({
    ...item,
    status_page: Array.isArray(item.status_pages) ? item.status_pages[0] || null : item.status_pages,
  })) as WebsiteWithStatusPage[];
}


export default async function StatusPagesPage() {
  const supabase = createSupabaseServerClient();
  const sites = await getWebsitesWithStatusPages(supabase);

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Status Pages</h3>
            <p className="text-sm text-muted-foreground">
                Create and manage public status pages for your monitored websites.
            </p>
        </div>
        <StatusPagesClient sites={sites} />
    </div>
  );
}
