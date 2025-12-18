
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import type { Note } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NoteDialog } from "@/components/notes/note-dialog";

export function NotesClientPage({ initialNotes }: { initialNotes: Note[] }) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { profile } = useUser();
    const timezone = profile?.timezone ?? 'UTC';

    const canCreateNotes = profile?.teams.some(team => team.role === 'ADMIN') ?? false;

    useEffect(() => {
        setNotes(initialNotes.map(note => ({
            ...note,
            created_at: formatInTimeZone(new Date(note.created_at), timezone, 'MMM d, yyyy, h:mm:ss a'),
            start_time: note.start_time ? formatInTimeZone(new Date(note.start_time), timezone, 'MMM d, h:mm a') : 'N/A',
            end_time: note.end_time ? formatInTimeZone(new Date(note.end_time), timezone, 'MMM d, h:mm a') : 'N/A',
        })));
    }, [initialNotes, timezone]);

    return (
         <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Notes & Logs</CardTitle>
                        <CardDescription>
                            A log of all manually created notes and maintenance windows.
                        </CardDescription>
                    </div>
                     {canCreateNotes && (
                        <Button onClick={() => setDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Note
                        </Button>
                     )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Event Start</TableHead>
                                <TableHead>Event End</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No notes recorded yet.</TableCell>
                                </TableRow>
                            ) : (
                                notes.map((note) => (
                                    <TableRow key={note.id}>
                                        <TableCell>
                                            <Link href={`/notes/${note.id}`} className="font-medium hover:underline">{note.title}</Link>
                                        </TableCell>
                                        <TableCell>{note.start_time}</TableCell>
                                        <TableCell>{note.end_time}</TableCell>
                                        <TableCell>{note.created_at}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
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
