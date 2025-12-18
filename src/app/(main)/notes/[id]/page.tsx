
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/db";
import { NoteClientPage } from "./note-client-page";

export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: { params: { id: string } }) {
    const supabase = createSupabaseServerClient();
    const noteId = parseInt(params.id, 10);
    
    if (isNaN(noteId)) {
        notFound();
    }

    const note = await getNoteById(supabase, noteId);
    
    if (!note) {
        notFound();
    }

    return <NoteClientPage initialNote={note} />;
}
