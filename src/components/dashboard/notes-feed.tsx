
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, StickyNote } from "lucide-react";
import { formatInTimeZone } from 'date-fns-tz';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteDialog } from '@/components/notes/note-dialog';
import type { Note } from "@/lib/types";
import { useUser } from "@/hooks/use-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NotesFeed({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { profile } = useUser();
  const timezone = profile?.timezone ?? 'UTC';

  const canCreateNotes = profile?.teams.some(team => team.role === 'ADMIN') ?? false;

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const recentNotes = notes.slice(0, 5);

  const truncate = (text: string | null | undefined, length: number) => {
    if (!text) return null;
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Notes</CardTitle>
                 {canCreateNotes && (
                    <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Note
                    </Button>
                 )}
            </CardHeader>
            <CardContent>
                {recentNotes.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">No notes created yet.</div>
                ) : (
                    <TooltipProvider>
                        <div className="space-y-4">
                            {recentNotes.map((note) => (
                                <Tooltip key={note.id} delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Link href={`/notes/${note.id}`} className="flex items-start gap-4 p-2 rounded-md hover:bg-muted/50">
                                            <StickyNote className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium truncate">{note.title}</p>
                                                <p className="text-xs text-muted-foreground/70 pt-1">
                                                    {formatInTimeZone(new Date(note.created_at), timezone, 'MMM d, yyyy, h:mm a')}
                                                </p>
                                            </div>
                                        </Link>
                                    </TooltipTrigger>
                                     {note.content && (
                                        <TooltipContent side="top" align="start">
                                            <p className="max-w-sm text-sm">{truncate(note.content, 150)}</p>
                                        </TooltipContent>
                                     )}
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                )}
            </CardContent>
            {notes.length > 5 && (
                 <CardFooter>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                        <Link href="/notes">View All Notes</Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
        {canCreateNotes && profile?.teams && (
             <NoteDialog 
                open={isDialogOpen}
                onOpenChange={setDialogOpen}
                teams={profile.teams.filter(t => t.role === 'ADMIN')}
            />
        )}
    </>
  );
}
