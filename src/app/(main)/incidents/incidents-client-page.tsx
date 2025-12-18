

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Incident } from "@/lib/types";
import { useUser } from "@/hooks/use-user";
import { formatInTimeZone } from 'date-fns-tz';
import { RecheckButton } from "@/components/dashboard/recheck-button";

const IncidentStatusBadge = ({ status, websiteId, siteName }: { status: Incident['status'], websiteId: number, siteName: string }) => {
  if (status === 'resolved') {
    return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>
  }
  return (
    <div className="flex items-center gap-2">
        <Badge variant="destructive">Ongoing</Badge>
        <RecheckButton websiteId={websiteId} siteName={siteName} />
    </div>
  )
}

export function IncidentsClientPage({ initialIncidents }: { initialIncidents: Incident[] }) {
    const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [selectedSiteName, setSelectedSiteName] = useState("");
    const { profile } = useUser();
    const timezone = profile?.timezone ?? 'UTC';


     useEffect(() => {
        setIncidents(initialIncidents.map(incident => ({
            ...incident,
            startedAt: formatInTimeZone(new Date(incident.startedAt), timezone, 'MMM d, yyyy, h:mm:ss a'),
            resolvedAt: incident.resolvedAt ? formatInTimeZone(new Date(incident.resolvedAt), timezone, 'MMM d, yyyy, h:mm:ss a') : 'N/A',
        })));
    }, [initialIncidents, timezone]);

    const handleReasonClick = (incident: Incident) => {
        setSelectedReason(incident.reason || "No reason provided.");
        setSelectedSiteName(incident.siteName);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Incident History</CardTitle>
                    <CardDescription>
                        A log of all downtime incidents for your monitored websites.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Website</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Started At</TableHead>
                                <TableHead>Resolved At</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incidents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No incidents recorded yet.</TableCell>
                                </TableRow>
                            ) : (
                                incidents.map((incident) => (
                                    <TableRow key={incident.id}>
                                        <TableCell>
                                            <div className="font-medium">{incident.siteName}</div>
                                            <div className="text-sm text-muted-foreground">{incident.siteUrl}</div>
                                        </TableCell>
                                        <TableCell>
                                            <IncidentStatusBadge status={incident.status} websiteId={incident.website_id} siteName={incident.siteName} />
                                        </TableCell>
                                        <TableCell 
                                            className="max-w-[200px] cursor-pointer hover:underline"
                                            title="Click to view full reason"
                                            onClick={() => handleReasonClick(incident)}
                                        >
                                            <p className="truncate">{incident.reason || 'N/A'}</p>
                                        </TableCell>
                                        <TableCell>{incident.startedAt}</TableCell>
                                        <TableCell>{incident.resolvedAt}</TableCell>
                                        <TableCell className="text-right">{incident.duration || 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Downtime Reason for {selectedSiteName}</DialogTitle>
                        <DialogDescription>
                           The full reason reported for the incident is provided below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 bg-muted/50 p-4 rounded-md text-sm text-foreground">
                        <p className="break-words">{selectedReason}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
