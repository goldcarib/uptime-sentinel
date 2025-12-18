
"use client";

import { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateConfluentSettingsAction, updateElevenLabsSettingsAction } from '@/app/(main)/settings/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import type { Team } from '@/lib/types';

const confluentFormSchema = z.object({
  team_id: z.coerce.number(),
  confluent_enabled: z.boolean().default(false),
  confluent_rest_endpoint: z.string().optional().nullable(),
  confluent_api_key: z.string().optional().nullable(),
  confluent_api_secret: z.string().optional().nullable(),
}).refine(data => {
    if (data.confluent_enabled) {
        return !!data.confluent_rest_endpoint && !!data.confluent_api_key && !!data.confluent_api_secret;
    }
    return true;
}, {
    message: "Endpoint, API Key, and Secret are required when Confluent is enabled.",
    path: ["confluent_enabled"],
});

type ConfluentFormValues = z.infer<typeof confluentFormSchema>;

const elevenLabsFormSchema = z.object({
  team_id: z.coerce.number(),
  elevenlabs_api_key: z.string().optional().nullable(),
  elevenlabs_voice_id: z.string().optional().nullable(),
});
type ElevenLabsFormValues = z.infer<typeof elevenLabsFormSchema>;


const initialFormState = {
  message: null,
  errors: undefined,
};

function ConfluentTeamForm({ team }: { team: Team }) {
    const [state, formAction] = useActionState(updateConfluentSettingsAction, initialFormState);
    const { toast } = useToast();

    const form = useForm<ConfluentFormValues>({
        resolver: zodResolver(confluentFormSchema),
        defaultValues: {
            team_id: team.id,
            confluent_enabled: team.confluent_enabled ?? false,
            confluent_rest_endpoint: team.confluent_rest_endpoint ?? '',
            confluent_api_key: team.confluent_api_key ?? '',
            confluent_api_secret: team.confluent_api_secret ?? '',
        },
    });

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.errors ? "Error" : "Settings Saved",
                description: state.message,
                variant: state.errors ? "destructive" : "default",
            });
        }
    }, [state, toast]);
    
    return (
        <Form {...form}>
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="team_id" value={team.id} />
                <FormField
                control={form.control}
                name="confluent_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Confluent Integration</FormLabel>
                        <FormDescription>
                        Stream uptime check data to your Confluent topic.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        name={field.name}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
                 {state?.errors?.confluent_enabled && <FormMessage>{state.errors.confluent_enabled[0]}</FormMessage>}

                <FormField
                    control={form.control}
                    name="confluent_rest_endpoint"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confluent REST Endpoint</FormLabel>
                        <FormControl>
                            <Input placeholder="https://pkc-....confluent.cloud:443" {...field} value={field.value ?? ''} />
                        </FormControl>
                         <FormDescription>
                            Include the cluster ID and port.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confluent_api_key"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Your Confluent API Key" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confluent_api_secret"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Your Confluent API Secret" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Save Confluent Settings</Button>
            </form>
        </Form>
    );
}

function ElevenLabsTeamForm({ team }: { team: Team }) {
    const [state, formAction] = useActionState(updateElevenLabsSettingsAction, initialFormState);
    const { toast } = useToast();

    const form = useForm<ElevenLabsFormValues>({
        resolver: zodResolver(elevenLabsFormSchema),
        defaultValues: {
            team_id: team.id,
            elevenlabs_api_key: team.elevenlabs_api_key ?? '',
            elevenlabs_voice_id: team.elevenlabs_voice_id ?? '',
        },
    });

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.errors ? "Error" : "Settings Saved",
                description: state.message,
                variant: state.errors ? "destructive" : "default",
            });
        }
    }, [state, toast]);
    
    return (
        <Form {...form}>
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="team_id" value={team.id} />
                <FormField
                    control={form.control}
                    name="elevenlabs_api_key"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>ElevenLabs API Key</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Your ElevenLabs API Key" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>
                            Your API key from ElevenLabs for text-to-speech.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="elevenlabs_voice_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Voice ID</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 21m00Tcm4TlvDq8ikWAM" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>
                            The ID of the voice you want to use.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Save ElevenLabs Settings</Button>
            </form>
        </Form>
    );
}


export function IntegrationSettingsDialog({
  open,
  onOpenChange,
  integrationName,
  teams,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string | null;
  teams: Team[];
}) {
    if (teams.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cannot Configure Integrations</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground py-4">
                        You are not an admin of any team, so you cannot configure integrations.
                    </p>
                </DialogContent>
            </Dialog>
        );
    }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>Configure {integrationName}</DialogTitle>
                <DialogDescription>
                    Configure third-party integrations for your teams. Settings are managed on a per-team basis.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                <Accordion type="single" collapsible className="w-full">
                    {teams.map(team => (
                        <AccordionItem value={`item-${team.id}`} key={team.id}>
                            <AccordionTrigger>{team.name}</AccordionTrigger>
                            <AccordionContent>
                                {integrationName === 'Confluent' && <ConfluentTeamForm team={team} />}
                                {integrationName === 'ElevenLabs' && <ElevenLabsTeamForm team={team} />}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </DialogContent>
    </Dialog>
  );
}
