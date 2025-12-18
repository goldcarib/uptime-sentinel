

"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMonitorDetailsClient } from '@/app/(main)/actions';
import type { MonitoredSite, MonitorDetails, Incident } from '@/lib/types';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Time
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Response
            </span>
            <span className="font-bold">
              {payload[0].value}ms
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const IncidentStatusBadge = ({ status }: { status: Incident['status'] }) => {
  if (status === 'resolved') {
    return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>
  }
  return <Badge variant="destructive">Ongoing</Badge>
}

export function MonitorDetailsDialog({ site, open, onOpenChange }: { site: MonitoredSite, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [details, setDetails] = useState<MonitorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [timeRange, setTimeRange] = useState("7"); // Default to 7 days
  const reportRef = useRef<HTMLDivElement>(null);
  const { profile } = useUser();
  const timezone = profile?.timezone ?? 'UTC';


  useEffect(() => {
    if (site && open) {
      setIsLoading(true);
      getMonitorDetailsClient(site.id, parseInt(timeRange, 10))
        .then(data => {
          const formattedIncidents = data.latestIncidents.map(incident => ({
            ...incident,
            startedAt: formatInTimeZone(new Date(incident.startedAt), timezone, 'MMM d, yyyy, h:mm:ss a'),
            resolvedAt: incident.resolvedAt ? formatInTimeZone(new Date(incident.resolvedAt), timezone, 'MMM d, yyyy, h:mm:ss a') : null,
          }));
          setDetails({ ...data, latestIncidents: formattedIncidents });
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch monitor details:", err);
          setIsLoading(false);
        });
    }
  }, [site, open, timeRange, timezone]);

  const handleExportToPdf = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    setIsExporting(true);

    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height] // Set PDF size to canvas size
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`report-${site.name.replace(/\s+/g, '-')}.pdf`);

    } catch (error) {
        console.error("Failed to export PDF", error);
    } finally {
        setIsExporting(false);
    }
  };


  const chartData = useMemo(() => {
    if (!details?.responseTimeStats.data) return [];
    
    return details.responseTimeStats.data.map(d => ({
        ...d,
        date: formatInTimeZone(new Date(d.date), timezone, "MMM d, HH:mm")
    }));
  }, [details, timezone]);

  const avgResponseTimeColor = useMemo(() => {
    if (!details) return '';
    const avg = parseFloat(details.responseTimeStats.average);
    if (avg > 1000) return 'text-destructive';
    if (avg > 500) return 'text-amber-500';
    return '';
  }, [details]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex-row justify-between items-center">
            <div>
              <DialogTitle>{site.name}</DialogTitle>
              <DialogDescription>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline">
                    {site.url}
                </a>
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={handleExportToPdf} disabled={isExporting || isLoading}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export to PDF"}
            </Button>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto">
            <div ref={reportRef} className="grid auto-rows-max items-start gap-4 p-4 bg-background">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        Array.from({length: 4}).map((_, i) => (
                             <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-20" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </CardContent>
                            </Card>
                        ))
                    ) : details?.uptimeStats.map(stat => (
                         <Card key={stat.period}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.period}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${parseFloat(stat.uptime) < 95 ? 'text-destructive' : 'text-green-500'}`}>{stat.uptime}%</div>
                                <p className="text-xs text-muted-foreground">{stat.incidents} incidents, {stat.downtime} down</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Response Time</CardTitle>
                            <CardDescription>Average, minimum, and maximum response time.</CardDescription>
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Last 24 hours</SelectItem>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            {isLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value, index) => {
                                            if (index === 0 || index === Math.floor(chartData.length / 2) || index === chartData.length - 1) {
                                               return format(new Date(value), "MMM d");
                                            }
                                            return '';
                                        }}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => `${value}ms`} 
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                                </AreaChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                         <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Average</p>
                                {isLoading ? <Skeleton className="h-6 w-1/2 mx-auto mt-1" /> : <p className={cn("text-xl font-bold", avgResponseTimeColor)}>{details?.responseTimeStats.average} ms</p>}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Minimum</p>
                                 {isLoading ? <Skeleton className="h-6 w-1/2 mx-auto mt-1" /> : <p className="text-xl font-bold">{details?.responseTimeStats.min} ms</p>}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Maximum</p>
                                {isLoading ? <Skeleton className="h-6 w-1/2 mx-auto mt-1" /> : <p className="text-xl font-bold">{details?.responseTimeStats.max} ms</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Latest Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Started At</TableHead>
                                    <TableHead className="text-right">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 3}).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : details?.latestIncidents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">This monitor does not have any incidents.</TableCell>
                                    </TableRow>
                                ) : (
                                    details?.latestIncidents.map((incident) => (
                                        <TableRow key={incident.id}>
                                            <TableCell>
                                                <IncidentStatusBadge status={incident.status} />
                                            </TableCell>
                                            <TableCell className="max-w-[250px] truncate">{incident.reason || 'N/A'}</TableCell>
                                            <TableCell>{incident.startedAt}</TableCell>
                                            <TableCell className="text-right">{incident.duration || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
