
"use client"

import { useEffect, useState, useActionState, useMemo } from "react";
import { MoreHorizontal, Search } from "lucide-react";

import { addWebsiteAction, deleteWebsiteAction, updateWebsiteAction } from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MonitoredSite, Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const initialState = {
  message: null,
  errors: undefined,
};

const checkIntervals = [
  { value: "1", label: "1 minute" },
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
];

function WebsiteForm({ site, teams, onOpenChange }: { site?: MonitoredSite | null; teams: (Team & { api_key?: string })[]; onOpenChange: (open: boolean) => void; }) {
    const action = site ? updateWebsiteAction.bind(null, site.id) : addWebsiteAction;
    const [state, formAction] = useActionState(action, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            const isError = state.message.toLowerCase().includes('failed');
            toast({
                variant: isError ? 'destructive' : 'default',
                title: isError ? 'Error' : 'Success',
                description: state.message,
            });
            if (!isError) {
                onOpenChange(false);
            }
        }
    }, [state, toast, onOpenChange]);


    return (
        <form action={formAction}>
            <div className="grid gap-4 py-4">
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="team_id">Team</Label>
                    <Select name="team_id" defaultValue={site?.team_id?.toString() ?? teams[0]?.id.toString()}>
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
                    {state.errors?.team_id && <p className="text-sm font-medium text-destructive">{state.errors.team_id[0]}</p>}
                </div>
                
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="My Website" required defaultValue={site?.name}/>
                    {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                </div>

                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input id="url" name="url" placeholder="https://example.com" type="url" required defaultValue={site?.url} />
                     {state.errors?.url && <p className="text-sm font-medium text-destructive">{state.errors.url[0]}</p>}
                </div>
                
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="check_interval">Check Interval</Label>
                    <Select name="check_interval" defaultValue={site?.check_interval?.toString() ?? "5"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an interval" />
                        </SelectTrigger>
                        <SelectContent>
                            {checkIntervals.map(interval => (
                                <SelectItem key={interval.value} value={interval.value}>
                                    {interval.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {state.errors?.check_interval && <p className="text-sm font-medium text-destructive">{state.errors.check_interval[0]}</p>}
                </div>
                 
                <div className="grid w-full items-center gap-2">
                    <Label htmlFor="notification_emails">Notification Emails (optional)</Label>
                    <Input id="notification_emails" name="notification_emails" placeholder="e.g. user1@example.com, user2@example.com" defaultValue={site?.notification_emails?.join(', ')}/>
                     <div className="text-sm text-muted-foreground">
                        Comma-separated list of emails to receive alerts.
                    </div>
                    {state.errors?.notification_emails && <p className="text-sm font-medium text-destructive">{state.errors.notification_emails[0]}</p>}
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="ignore_ssl">Ignore SSL Errors</Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Use for sites with self-signed or invalid SSL certificates.
                        </p>
                    </div>
                    <Switch id="ignore_ssl" name="ignore_ssl" defaultChecked={site?.ignore_ssl} />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">{site ? 'Save Changes' : 'Add Website'}</Button>
            </DialogFooter>
        </form>
    )
}

export function WebsiteSettings({ sites, teams }: { sites: MonitoredSite[], teams: (Team & { api_key?: string })[] }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<MonitoredSite | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    
    const canManageWebsites = teams.length > 0;

    const filteredSites = useMemo(() => 
        sites.filter(site => 
            site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.url.toLowerCase().includes(searchTerm.toLowerCase())
        ), 
    [sites, searchTerm]);

    const handleEdit = (site: MonitoredSite) => {
        setSelectedSite(site);
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setSelectedSite(null);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        const result = await deleteWebsiteAction(id);
        if (result.message) {
             toast({
                title: result.message.includes('success') ? 'Success' : 'Error',
                description: result.message,
                variant: result.message.includes('success') ? 'default' : 'destructive'
            });
        }
    };


  return (
    <Card>
        <CardHeader>
            <CardTitle>Manage Websites</CardTitle>
            <CardDescription>
            Add, edit, or remove websites you want to monitor for your teams.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name or URL..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {canManageWebsites && (
                <Button onClick={handleAddNew} className="w-full md:w-auto">Add New Website</Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{selectedSite ? 'Edit Website' : 'Add Website'}</DialogTitle>
                    <DialogDescription>
                    {selectedSite ? 'Update the details of your monitored website.' : 'Enter the details of the website you want to monitor.'}
                    </DialogDescription>
                </DialogHeader>
                <WebsiteForm site={selectedSite} teams={teams} onOpenChange={setDialogOpen}/>
                </DialogContent>
            </Dialog>
            </div>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Notifications</TableHead>
                {canManageWebsites && (
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredSites.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={canManageWebsites ? 5 : 4} className="text-center">
                            {sites.length === 0 ? "No websites are being monitored yet." : "No websites match your search."}
                        </TableCell>
                    </TableRow>
                ) : filteredSites.map((site) => (
                <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>{site.url}</TableCell>
                    <TableCell>{site.check_interval} min</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                        {site.notification_emails?.join(', ') || '-'}
                    </TableCell>
                    {canManageWebsites && teams.some(t => t.id === site.team_id) && (
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(site)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this website from your monitoring list.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(site.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    )}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
        <CardFooter>
            <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredSites.length}</strong> of{" "}
            <strong>{sites.length}</strong> websites
            </div>
        </CardFooter>
    </Card>
  );
}
