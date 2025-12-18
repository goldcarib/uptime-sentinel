
"use client";

import { useEffect, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { upsertStatusPageAction } from "./actions";
import type { WebsiteWithStatusPage } from "@/lib/types";

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

export function StatusPageDialog({
  site,
  open,
  onOpenChange,
}: {
  site: WebsiteWithStatusPage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(upsertStatusPageAction, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        onOpenChange(false);
      }
    }
  }, [state, toast, onOpenChange]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status Page Settings for {site.name}</DialogTitle>
          <DialogDescription>
            Configure the public status page for this website.
          </DialogDescription>
        </DialogHeader>
        <form key={site.id} action={formAction} className="space-y-4">
            <input type="hidden" name="website_id" value={site.id} />

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label htmlFor="is_public">Enable Public Page</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                    Make this status page accessible to the public.
                    </p>
                </div>
                <Switch
                    id="is_public"
                    name="is_public"
                    defaultChecked={site.status_page?.is_public ?? false}
                />
            </div>
             {state.errors?.is_public && <p className="text-sm font-medium text-destructive">{state.errors.is_public[0]}</p>}

            <div>
                <Label htmlFor="password">Password (Optional)</Label>
                <Input id="password" name="password" type="password" defaultValue={site.status_page?.password ?? ""} />
                <p className="text-[0.8rem] text-muted-foreground mt-1">
                    Require a password to view this status page.
                </p>
                 {state.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
            </div>

            <div>
                <Label htmlFor="allowed_ips">Allowed IP Addresses (Optional)</Label>
                <Textarea id="allowed_ips" name="allowed_ips" defaultValue={site.status_page?.allowed_ips?.join(", ") ?? ""} />
                 <p className="text-[0.8rem] text-muted-foreground mt-1">
                    Comma-separated list of IPs. Only these IPs can view the page.
                </p>
                 {state.errors?.allowed_ips && <p className="text-sm font-medium text-destructive">{state.errors.allowed_ips[0]}</p>}
            </div>

          <DialogFooter>
            <Button type="submit">
                Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
