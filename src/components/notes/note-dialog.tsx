
"use client";

import { useEffect, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createNoteAction, updateNoteAction } from "@/app/(main)/notes/actions";
import type { Team, Note } from "@/lib/types";
import { formatInTimeZone } from 'date-fns-tz';

const noteSchema = z.object({
    team_id: z.coerce.number(),
    title: z.string().min(1, { message: "Title is required." }),
    content: z.string().optional(),
    start_time: z.date().optional(),
    end_time: z.date().optional(),
    reminder_period: z.string().optional(),
});

const reminderPeriods = [
  { value: "1_hour", label: "1 hour before" },
  { value: "5_hours", label: "5 hours before" },
  { value: "1_day", label: "1 day before" },
  { value: "3_days", label: "3 days before" },
  { value: "1_week", label: "1 week before" },
];

const initialState = {
  message: null,
  errors: undefined,
};

// Helper to format date for datetime-local input
const formatForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Format to "yyyy-MM-ddTHH:mm"
        return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
        return '';
    }
};

export function NoteDialog({ note, teams, open, onOpenChange }: { note?: Note | null, teams: Team[], open: boolean, onOpenChange: (open: boolean) => void }) {
    const isEditMode = !!note;
    const action = isEditMode ? updateNoteAction : createNoteAction;
    const [state, formAction] = useActionState(action, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message) {
            const isError = !!state.errors;
            toast({
                title: isError ? "Error" : "Success",
                description: state.message,
                variant: isError ? "destructive" : "default",
            });
            if (!isError) {
                onOpenChange(false);
            }
        }
    }, [state, toast, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Note" : "Create a New Note"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Update the details of your note or event." : "Log a maintenance window, a scheduled event, or any other note for your team."}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                     {isEditMode && <input type="hidden" name="id" value={note.id} />}
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="team_id">Team</Label>
                            <Select name="team_id" defaultValue={note?.team_id.toString() ?? teams[0]?.id.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id.toString()}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {state?.errors?.team_id && <p className="text-sm font-medium text-destructive">{state.errors.team_id[0]}</p>}
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Database Server Upgrade" required defaultValue={note?.title}/>
                             {state?.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                        </div>
                        
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="content">Content (Optional)</Label>
                            <Textarea id="content" name="content" placeholder="Describe the event or note..." defaultValue={note?.content ?? ''} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid w-full items-center gap-2">
                                <Label>Start Time (Optional)</Label>
                                 <Input type="datetime-local" name="start_time" defaultValue={formatForInput(note?.start_time)} />
                            </div>
                             <div className="grid w-full items-center gap-2">
                                <Label>End Time (Optional)</Label>
                                <Input type="datetime-local" name="end_time" defaultValue={formatForInput(note?.end_time)} />
                            </div>
                        </div>

                         <div className="grid w-full items-center gap-2">
                            <Label htmlFor="reminder_period">Reminder (Optional)</Label>
                            <Select name="reminder_period" defaultValue={note?.reminder_period ?? undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Do not send a reminder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reminderPeriods.map(period => (
                                        <SelectItem key={period.value} value={period.value}>
                                            {period.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit">{isEditMode ? "Save Changes" : "Create Note"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
