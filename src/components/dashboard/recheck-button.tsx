
"use client";

import { useTransition } from 'react';
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { recheckWebsiteAction } from '@/app/(main)/actions';

export function RecheckButton({ websiteId, siteName }: { websiteId: number, siteName: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleRecheck = () => {
        startTransition(async () => {
            const result = await recheckWebsiteAction(websiteId);
            toast({
                title: result.success ? "Re-check Started" : "Error",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleRecheck}
            disabled={isPending}
            className="h-6 w-6 text-muted-foreground hover:text-primary"
            aria-label={`Re-check status for ${siteName}`}
            title={`Re-check status for ${siteName}`}
        >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
    );
}
