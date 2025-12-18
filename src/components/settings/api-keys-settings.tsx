
"use client"

import { useState, useTransition, useEffect } from "react";
import { RefreshCw, Clipboard, Check } from "lucide-react";

import { regenerateApiKeyAction } from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Team } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


function ApiKeyManager({ team }: { team: (Team & { api_key?: string }) }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        // This ensures window is available, only runs on client
        setBaseUrl(window.location.origin);
    }, []);


    const handleRegenerate = () => {
        startTransition(async () => {
            const result = await regenerateApiKeyAction(team.id);
            toast({
                title: result.success ? "Success" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    };

    const handleCopyKey = () => {
        if (team.api_key) {
            navigator.clipboard.writeText(team.api_key);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };
    
    const feedUrl = baseUrl ? `${baseUrl}/api/incidents/feed.json` : `/api/incidents/feed.json`;
    const curlCommand = `curl -H "Authorization: Bearer ${team.api_key}" "${feedUrl}"`;
    
    const handleCopyCurl = () => {
        navigator.clipboard.writeText(curlCommand);
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
    };
    
    if (!team.api_key) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <div className="space-y-6">
             <div>
                <Label htmlFor={`api-key-${team.id}`}>Incident Feed API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Input
                        id={`api-key-${team.id}`}
                        readOnly
                        value={team.api_key}
                        className="font-mono"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={handleCopyKey}>
                                {copiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                                <span className="sr-only">Copy API Key</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy API Key</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <Label htmlFor={`curl-${team.id}`}>Example Usage (cURL)</Label>
                 <div className="flex items-center gap-2 mt-1">
                    <Input
                        id={`curl-${team.id}`}
                        readOnly
                        value={curlCommand}
                        className="font-mono text-xs bg-background"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={handleCopyCurl}>
                                {copiedCurl ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                                <span className="sr-only">Copy cURL command</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy cURL command</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">Use this command to fetch the JSON incident feed for this team.</p>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isPending}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                        Regenerate API Key
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will invalidate the current API key and cURL command. Any services using the old key will need to be updated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerate} className="bg-destructive hover:bg-destructive/90">
                            Regenerate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


export function ApiKeySettings({ teams }: { teams: (Team & { api_key?: string })[] }) {
    const canManageKeys = teams.length > 0;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                    Manage API keys for your teams to access data feeds like the JSON incident feed.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {canManageKeys ? (
                    teams.map(team => (
                        <div key={team.id}>
                            <h4 className="font-medium mb-2">{team.name}</h4>
                            <ApiKeyManager team={team} />
                        </div>
                     ))
                ) : (
                    <p className="text-sm text-muted-foreground">You do not have permission to manage API keys for any team.</p>
                )}
            </CardContent>
        </Card>
    );
}
