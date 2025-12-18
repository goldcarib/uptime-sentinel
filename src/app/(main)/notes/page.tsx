
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getNotes } from "@/lib/db";
import { NotesClientPage } from "./notes-client-page";

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const supabase = createSupabaseServerClient();
  const notes = await getNotes(supabase);

  return <NotesClientPage initialNotes={notes} />;
}
