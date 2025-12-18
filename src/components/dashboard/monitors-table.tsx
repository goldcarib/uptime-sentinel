

"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { MonitorDetailsDialog } from '@/components/dashboard/monitor-details-dialog';
import type { MonitoredSite } from "@/lib/types";
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { formatInTimeZone } from 'date-fns-tz';

const ITEMS_PER_PAGE = 10;

const StatusIcon = ({ status }: { status: MonitoredSite["status"] }) => {
  switch (status) {
    case "up":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "down":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const UptimeProgressBar = ({ uptime }: { uptime: string }) => {
    const uptimeValue = parseFloat(uptime);
    const progressBarColor = cn({
        "[&>div]:bg-green-500": uptimeValue > 99,
        "[&>div]:bg-yellow-500": uptimeValue <= 99 && uptimeValue > 95,
        "[&>div]:bg-red-500": uptimeValue <= 95,
    });

    return (
        <div className="w-24">
            <Progress value={uptimeValue} className={cn("h-2 w-full", progressBarColor)} />
            <span className="text-xs text-muted-foreground mt-1 block">{uptime}% Uptime</span>
        </div>
    );
};

export function MonitorsTable({ sites }: { sites: MonitoredSite[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSite, setSelectedSite] = useState<MonitoredSite | null>(null);
    const [formattedSites, setFormattedSites] = useState(sites);
    const { profile } = useUser();
    const timezone = profile?.timezone ?? 'UTC';


    useEffect(() => {
        setFormattedSites(sites.map(site => ({
            ...site,
            lastChecked: site.lastChecked ? formatInTimeZone(new Date(site.lastChecked), timezone, 'MMM d, yyyy, h:mm:ss a') : 'Never'
        })));
    }, [sites, timezone]);

    const filteredSites = useMemo(() => 
        formattedSites.filter(site => 
            site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.url.toLowerCase().includes(searchTerm.toLowerCase())
        ), 
    [formattedSites, searchTerm]);

    const totalPages = Math.ceil(filteredSites.length / ITEMS_PER_PAGE);
    const paginatedSites = filteredSites.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
         <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between px-7 gap-4">
                <div>
                    <CardTitle>Monitors</CardTitle>
                    <CardDescription>
                    A list of all your monitored websites and their current status.
                    </CardDescription>
                </div>
                 <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or URL..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on new search
                        }}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Uptime (30d)</TableHead>
                    <TableHead className="text-right">Last Checked</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedSites.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                {sites.length === 0 ? "No websites are being monitored yet." : "No monitors match your search."}
                            </TableCell>
                        </TableRow>
                    ) : paginatedSites.map((site) => (
                    <TableRow key={site.id} onClick={() => setSelectedSite(site)} className="cursor-pointer">
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <StatusIcon status={site.status} />
                            <span className="capitalize">{site.status}</span>
                        </div>
                        </TableCell>
                        <TableCell>
                        <div className="font-medium truncate" title={site.name}>{site.name}</div>
                        <div className="text-sm text-muted-foreground truncate" title={site.url}>{site.url}</div>
                        </TableCell>
                        <TableCell>
                           <UptimeProgressBar uptime={site.uptime} />
                        </TableCell>
                        <TableCell className="text-right">{site.lastChecked}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="text-xs text-muted-foreground">
                    Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSites.length)}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredSites.length)}</strong> of{" "}
                    <strong>{filteredSites.length}</strong> monitors
                </div>
                <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </CardFooter>
        </Card>
        {selectedSite && (
            <MonitorDetailsDialog 
                site={selectedSite} 
                open={!!selectedSite} 
                onOpenChange={(open) => { if(!open) setSelectedSite(null)}} 
            />
        )}
        </>
    )
}
