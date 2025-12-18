
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationSettingsDialog } from "@/components/settings/integration-settings-dialog";
import type { Team } from "@/lib/types";
import { Headphones } from "lucide-react";

const integrationsList = [
  {
    name: "Slack",
    description: "Send real-time alerts to your team's Slack channels.",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A154B]"><path d="M12.92 7.23a2.5 2.5 0 0 0-3.53 0" /><path d="M16.77 7.23a2.5 2.5 0 0 1 0 3.53" /><path d="M7.23 11.08a2.5 2.5 0 0 0 0 3.53" /><path d="M7.23 16.77a2.5 2.5 0 0 1 3.53 0" /><path d="M11.08 16.77a2.5 2.5 0 0 0 3.53 0" /><path d="M7.23 16.77a2.5 2.5 0 0 0 0-3.53" /><path d="M16.77 12.92a2.5 2.5 0 0 1-3.53 0" /><path d="M16.77 7.23a2.5 2.5 0 0 0-3.53 0" /></svg>
    ),
    enabled: false,
    configurable: false,
  },
  {
    name: "Discord",
    description: "Get incident notifications directly in your Discord server.",
     icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5865F2]"><path d="M14.4 11.05c0-1.1-.9-2-2-2s-2 .9-2 2.05c0 1.1.9 2 2 2s2-.9 2-2z" /><path d="M19 11.05c0-1.1-.9-2-2-2s-2 .9-2 2.05c0 1.1.9 2 2 2s2-.9 2-2z" /><path d="M7.5 11.05c0-1.1.9-2 2-2s2 .9 2 2.05c0 1.1-.9 2-2 2s-2-.9-2-2z" /><path d="m16.5 16.25-1.4-1.4c-.4-.4-.9-.6-1.5-.6H10c-.6 0-1.1.2-1.5.6l-1.4 1.4" /><path d="M19 3H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /></svg>
    ),
    enabled: false,
    configurable: false,
  },
  {
    name: "Webhooks",
    description: "Send alerts to any custom URL or third-party service.",
    icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
    ),
    enabled: false,
    configurable: false,
  },
   {
    name: "Confluent",
    description: "Log uptime check data as a stream to your Confluent Cloud topic.",
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#231F20]"><path d="M10 10a10 10 0 0 0-4.17 8.35" /><path d="M10 10l6-6" /><path d="M10 10a10 10 0 0 1 4.17 8.35" /><path d="M10 10a10 10 0 0 1-8.35-4.17" /><path d="M10 10l-6 6" /><path d="M10 10a10 10 0 0 0 8.35-4.17" /></svg>
    ),
    enabled: true,
    configurable: true,
  },
  {
    name: "ElevenLabs",
    description: "Enable high-quality, natural-sounding voice responses in the chat.",
    icon: (
      <Headphones size={32} strokeWidth={2} className="text-[#00D6D9]" />
    ),
    enabled: true,
    configurable: true,
  },
];

export function IntegrationsClientPage({ teams }: { teams: Team[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const handleConfigureClick = (integrationName: string) => {
    setSelectedIntegration(integrationName);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect Uptime Sentinel to your favorite tools and services.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationsList.map((integration) => (
            <Card key={integration.name}>
              <CardHeader className="flex flex-row items-center gap-4">
                {integration.icon}
                <CardTitle>{integration.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </CardContent>
              <CardFooter>
                {integration.configurable ? (
                  <Button variant="outline" onClick={() => handleConfigureClick(integration.name)}>
                    Configure
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Configure
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle>More Integrations Coming Soon!</CardTitle>
            <CardDescription>
              We are always working on adding new integrations. Let us know what you'd like to see next.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <IntegrationSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        integrationName={selectedIntegration}
        teams={teams}
      />
    </>
  );
}
