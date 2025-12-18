
"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { inviteMemberAction } from "@/app/(main)/team-members/actions";

const initialState = {
  message: null,
  error: false,
  errors: undefined,
};

export function InviteMemberDialog({ teamId, teamName, open, onOpenChange }: { teamId: number; teamName: string; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [state, formAction] = useActionState(inviteMemberAction, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.error ? "Error" : "Success",
                description: state.message,
                variant: state.error ? "destructive" : "default",
            });
            if (!state.error) {
                onOpenChange(false);
            }
        }
    }, [state, toast, onOpenChange]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Member to {teamName}</DialogTitle>
                    <DialogDescription>
                        Enter the email address of the person you want to invite. They will receive a custom email with a link to sign up.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="team_id" value={teamId} />
                    <input type="hidden" name="team_name" value={teamName} />
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                             {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                        </div>
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" defaultValue="MEMBER">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">Member (View-only)</SelectItem>
                                    <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                                </SelectContent>
                            </Select>
                            {state.errors?.role && <p className="text-sm font-medium text-destructive">{state.errors.role[0]}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Send Invitation</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
