
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const noteSchema = z.object({
  team_id: z.coerce.number({ required_error: "Team is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  content: z.string().optional(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  reminder_period: z.string().optional().nullable(),
});

type State = {
  message?: string | null;
  errors?: z.ZodError<typeof noteSchema>['formErrors']['fieldErrors'];
};

export async function createNoteAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to create a note." };
  }

  const validatedFields = noteSchema.safeParse({
    team_id: formData.get("team_id"),
    title: formData.get("title"),
    content: formData.get("content"),
    start_time: formData.get("start_time") || null,
    end_time: formData.get("end_time") || null,
    reminder_period: formData.get("reminder_period") || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }
  
  const noteData = {
    ...validatedFields.data,
    user_id: user.id,
    start_time: validatedFields.data.start_time ? new Date(validatedFields.data.start_time).toISOString() : null,
    end_time: validatedFields.data.end_time ? new Date(validatedFields.data.end_time).toISOString() : null,
  };


  try {
    const { error } = await supabase.from('notes').insert(noteData);
    if (error) throw error;
    
    revalidatePath("/");
    revalidatePath("/notes");
    return { message: "Note created successfully." };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to create note: ${e.message}` };
  }
}

const updateNoteSchema = noteSchema.extend({
  id: z.coerce.number(),
});

export async function updateNoteAction(prevState: State, formData: FormData): Promise<State> {
  const supabase = createSupabaseServerClient();
  const validatedFields = updateNoteSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid form data.",
    };
  }

  const { id, ...noteDataToUpdate } = validatedFields.data;

  const noteData = {
    ...noteDataToUpdate,
    start_time: validatedFields.data.start_time ? new Date(validatedFields.data.start_time).toISOString() : null,
    end_time: validatedFields.data.end_time ? new Date(validatedFields.data.end_time).toISOString() : null,
  };
  
  try {
    const { error } = await supabase.from('notes').update(noteData).eq('id', id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/notes");
    revalidatePath(`/notes/${id}`);
    return { message: "Note updated successfully." };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to update note: ${e.message}` };
  }
}
