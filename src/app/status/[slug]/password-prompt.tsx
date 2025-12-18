
"use client";

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { verifyPasswordAction } from './actions';
import { Icons } from '@/components/icons';

const initialState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Verifying..." : "View Status Page"}
    </Button>
  );
}

export function PasswordPrompt({ slug, siteName }: { slug: string, siteName: string }) {
  const [state, formAction] = useActionState(verifyPasswordAction, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: "Access Denied",
        description: state.message,
        variant: "destructive",
      });
    } else if (state.success) {
      router.refresh();
    }
  }, [state, toast, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Password Required</CardTitle>
            <CardDescription>This status page is password protected. Please enter the password to view the status of {siteName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
