"use client";

import { useState, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatInTimeZone } from 'date-fns-tz';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { NoteDialog } from "@/components/notes/note-dialog";
import type { Note, Team } from "@/lib/types";

// The note fetched from the server
type InitialNote = Note & { author_email: string; };

export function NoteClientPage({ initialNote }: { initialNote: InitialNote }) {
    const [note, setNote] = useState<InitialNote>(initialNote);
    const [adminTeams, setAdminTeams] = useState<Team[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const { profile } = useUser();
    
    useEffect(() => {
        // When the initialNote prop changes (e.g. on navigation), update the state
        setNote(initialNote);
    }, [initialNote]);

    useEffect(() => {
        if (profile) {
            // Find which teams the user is an admin of.
            const teamsUserIsAdminOf = profile.teams.filter(team => team.role === 'ADMIN');
            setAdminTeams(teamsUserIsAdminOf);
        }
    }, [profile]);
    
    // Check if the current user is an admin of the team this note belongs to
    const canEdit = useMemo(() => 
        adminTeams.some(team => team.id === note.team_id), 
    [adminTeams, note.team_id]);

    const formatDateTime = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        const timezone = profile?.timezone ?? 'UTC';
        return formatInTimeZone(new Date(date), timezone, 'MMM d, yyyy, h:mm a zzz');
    };
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">{note.title}</CardTitle>
                            <CardDescription>
                                Created on {formatDateTime(note.created_at)} by {note.author_email}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {note.reminder_period && (
                                <Badge variant="secondary">Reminder: {note.reminder_period.replace(/_/g, ' ')} before</Badge>
                            )}
                            {canEdit && (
                                <Button variant="outline" onClick={() => setDialogOpen(true)}>Edit</Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {note.content && (
                        <div className="prose dark:prose-invert max-w-none">
                            <p>{note.content}</p>
                        </div>
                    )}
                
                    {(note.start_time || note.end_time) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Start Time</h4>
                                <p>{formatDateTime(note.start_time)}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">End Time</h4>
                                <p>{formatDateTime(note.end_time)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            {canEdit && (
                <NoteDialog
                    note={note}
                    teams={adminTeams}
                    open={isDialogOpen}
                    onOpenChange={setDialogOpen}
                />
            )}
        </>
    );
}
