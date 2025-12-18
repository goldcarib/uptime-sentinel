
"use client";

import { useState, useEffect, useTransition } from "react";
import { MoreHorizontal, PlusCircle, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { Team, TeamUser } from "@/lib/types";
import { removeMemberAction, getTeamMembersWithEmails } from "./actions";


export function TeamMembersClientPage({ teams, initialMembers, currentUserId }: { teams: (Team & { role: string })[], initialMembers: TeamUser[], currentUserId: string }) {
    
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0] || null);
    const [members, setMembers] = useState<TeamUser[]>(initialMembers);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, startTransition] = useTransition();
    const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
    const { toast } = useToast();
    const [popoverOpen, setPopoverOpen] = useState(false)

    useEffect(() => {
        if (selectedTeam) {
            setError(null);
            startTransition(async () => {
                try {
                    const membersWithEmails = await getTeamMembersWithEmails(selectedTeam.id);
                    setMembers(membersWithEmails);
                } catch (e: any) {
                    setError(`Failed to load team members: ${e.message}`);
                    setMembers([]); // Clear members on error
                }
            });
        } else {
            setMembers([]);
        }
    }, [selectedTeam]);


    const handleRemoveMember = async (userId: string) => {
        if (!selectedTeam) return;
        const result = await removeMemberAction(userId, selectedTeam.id);
        if (result.error) {
            toast({ title: "Error", description: result.message, variant: "destructive" });
        } else {
            setMembers(members.filter(m => m.user_id !== userId));
            toast({ title: "Member Removed", description: result.message });
        }
    };

    const teamSwitcher = (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                {selectedTeam ? selectedTeam.name : "Select a team"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search team..." />
                    <CommandEmpty>No team found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                        {teams.map((team) => (
                            <CommandItem
                            key={team.id}
                            value={team.name}
                            onSelect={() => {
                                setSelectedTeam(team);
                                setPopoverOpen(false);
                            }}
                            >
                            {team.name}
                            </CommandItem>
                        ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Invite and manage members for the selected team.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            {teams.length > 1 && teamSwitcher}
                            <Button onClick={() => setInviteDialogOpen(true)} disabled={!selectedTeam}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Loading members...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-destructive">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : members.length > 0 ? (
                                members.map((member) => (
                                    <TableRow key={member.user_id}>
                                        <TableCell className="font-medium">{member.email}</TableCell>
                                        <TableCell>
                                           <Badge variant={member.role === 'ADMIN' ? "default" : "secondary"}>
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                            {member.user_id !== currentUserId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem disabled>Edit Role</DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                    Remove
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently remove this user from the team. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleRemoveMember(member.user_id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        {!selectedTeam ? "Please select a team to see its members." : "No team members yet."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {selectedTeam && (
                <InviteMemberDialog 
                    teamId={selectedTeam.id}
                    teamName={selectedTeam.name}
                    open={isInviteDialogOpen} 
                    onOpenChange={setInviteDialogOpen} 
                />
            )}
        </>
    );
}
