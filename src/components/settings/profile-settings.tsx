

"use client";

import { useEffect, useActionState } from "react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateEmailAction, updatePasswordAction, updateTimezoneAction } from "@/app/(main)/settings/actions";
import { timezones } from "@/lib/timezones";
import { useUser } from "@/hooks/use-user";

const initialFormState = {
  message: null,
  errors: undefined,
};

function UpdateEmailForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateEmailAction, initialFormState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>
          Change the email address associated with your account. A confirmation will be sent to both addresses.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required defaultValue={user.email} />
            {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Update Email</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function UpdateTimezoneForm() {
  const { profile } = useUser();
  const [state, formAction] = useActionState(updateTimezoneAction, initialFormState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
       if (!state.errors) {
         window.location.reload();
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timezone</CardTitle>
        <CardDescription>
          Set your local timezone to see all dates and times correctly adjusted.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select name="timezone" defaultValue={profile?.timezone ?? "UTC"}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                    {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                            {tz}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {state.errors?.team_id && <p className="text-sm font-medium text-destructive">{state.errors.team_id[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Update Timezone</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialFormState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.errors ? "Error" : "Success",
        description: state.message,
        variant: state.errors ? "destructive" : "default",
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Update your password. It must be at least 8 characters long.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" required />
                 {state.errors?.newPassword && <p className="text-sm font-medium text-destructive">{state.errors.newPassword[0]}</p>}
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Update Password</Button>
        </CardFooter>
      </form>
    </Card>
  );
}


export function ProfileSettings({ user }: { user: User }) {
  return (
    <div className="grid gap-6">
      <UpdateEmailForm user={user} />
      <UpdateTimezoneForm />
      <UpdatePasswordForm />
    </div>
  );
}
