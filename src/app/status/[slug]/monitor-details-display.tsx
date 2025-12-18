

"use client";

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
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
import { Badge } from '@/components/ui/badge';
import type { MonitoredSite, MonitorDetails, Incident } from '@/lib/types';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Response</span>
            <span className="font-bold">{payload[0].value}ms</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const IncidentStatusBadge = ({ status }: { status: Incident['status'] }) => {
  if (status === 'resolved') {
    return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>;
  }
  return <Badge variant="destructive">Ongoing</Badge>;
};

const StatusBanner = ({ status, lastChecked, timezone }: { status: MonitoredSite['status'], lastChecked: string | null, timezone: string }) => {
    const formattedLastChecked = useMemo(() => {
        if (!lastChecked) return null;
        try {
            return formatInTimeZone(new Date(lastChecked), timezone, 'MMM d, yyyy, h:mm:ss a zzz');
        } catch(e) {
            console.warn("Could not format date with timezone", e);
            return new Date(lastChecked).toLocaleString();
        }
    }, [lastChecked, timezone]);

    const isUp = status === 'up';
    const isDown = status === 'down';
    const isPending = status === 'pending';

    const bgColor = isUp ? 'bg-green-500/10' : isDown ? 'bg-destructive/10' : 'bg-muted';
    const borderColor = isUp ? 'border-green-500/20' : isDown ? 'border-destructive/20' : 'border-border';
    const textColor = isUp ? 'text-green-700' : isDown ? 'text-destructive' : 'text-muted-foreground';

    const Icon = isUp ? CheckCircle2 : isDown ? XCircle : Clock;
    const message = isUp ? "All systems operational." : isDown ? "A service disruption is currently active." : "Status is pending initial check.";

    return (
        <Card className={cn(bgColor, borderColor)}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Icon className={cn("h-8 w-8", textColor)} />
                <div>
                    <CardTitle className={cn("text-lg", textColor)}>{message}</CardTitle>
                    {formattedLastChecked && <CardDescription>Last checked: {formattedLastChecked}</CardDescription>}
                </div>
            </CardHeader>
        </Card>
    );
};

export function MonitorDetailsDisplay({ site, details, timezone }: { site: MonitoredSite, details: MonitorDetails, timezone: string }) {
  const formattedIncidents = details.latestIncidents.map(incident => ({
      ...incident,
      startedAt: formatInTimeZone(new Date(incident.startedAt), timezone, 'MMM d, yyyy, h:mm:ss a'),
  }));
  
  const chartData = details.responseTimeStats.data.map(d => ({
      ...d,
      date: formatInTimeZone(new Date(d.date), timezone, "MMM d, HH:mm")
  }));

  const avgResponseTimeColor = useMemo(() => {
    if (!details) return '';
    const avg = parseFloat(details.responseTimeStats.average);
    if (avg > 1000) return 'text-destructive';
    if (avg > 500) return 'text-amber-500';
    return '';
  }, [details]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{site.name} Status</h1>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline break-all">
                {site.url}
            </a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icons.logo className="h-6 w-6" />
          <span className="text-sm">Powered by Uptime Sentinel</span>
        </div>
      </header>

      <StatusBanner status={site.status} lastChecked={site.lastChecked} timezone={timezone} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {details?.uptimeStats.map(stat => (
          <Card key={stat.period}>
            <CardHeader className="pb-2">
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
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
          <CardDescription>Average, minimum, and maximum response time over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}ms`} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className={cn("text-xl font-bold", avgResponseTimeColor)}>{details?.responseTimeStats.average} ms</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="text-xl font-bold">{details?.responseTimeStats.min} ms</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="text-xl font-bold">{details?.responseTimeStats.max} ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident History</CardTitle>
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
              {formattedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No incidents recorded in the last 7 days.</TableCell>
                </TableRow>
              ) : (
                formattedIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell><IncidentStatusBadge status={incident.status} /></TableCell>
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
  );
}

    

    

    