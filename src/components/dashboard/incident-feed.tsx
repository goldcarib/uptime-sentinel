
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from "lucide-react";
import { formatInTimeZone } from 'date-fns-tz';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RecheckButton } from '@/components/dashboard/recheck-button';
import type { Incident } from "@/lib/types";
import { useUser } from "@/hooks/use-user";

const IncidentStatusBadge = ({ status }: { status: Incident['status'] }) => {
  if (status === 'resolved') {
    return <Badge variant="outline" className="text-green-500 border-green-500">Resolved</Badge>
  }
  return <Badge variant="destructive">Ongoing</Badge>
}

export function IncidentFeed({ initialIncidents }: { initialIncidents: Incident[] }) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const { profile } = useUser();
  const timezone = profile?.timezone ?? 'UTC';

  useEffect(() => {
    setIncidents(initialIncidents);
  }, [initialIncidents]);

  const recentIncidents = incidents.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
         {recentIncidents.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No incidents recorded yet.</div>
            ) : (
            <div className="space-y-4">
            {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{incident.siteName}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {incident.status === 'ongoing' && (
                                  <RecheckButton websiteId={incident.website_id} siteName={incident.siteName} />
                              )}
                              <IncidentStatusBadge status={incident.status} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground/70 pt-1">
                          {formatInTimeZone(new Date(incident.startedAt), timezone, 'MMM d, yyyy, h:mm:ss a')}
                        </p>
                    </div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
          <Link href="/incidents">View All Incidents</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
