
"use client";

import { useEffect, useActionState, Suspense } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordAction } from "./actions";
import { Icons } from "@/components/icons";
import { createBrowserClient } from "@supabase/ssr";

const initialState = {
  message: null,
  success: false,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Resetting Password..." : "Reset Password"}
    </Button>
  );
}

// The form needs to be a separate component to be wrapped in Suspense
function PasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        // Redirect to login after a short delay to allow the toast to be seen
        setTimeout(() => router.push("/login"), 1000);
      }
    }
  }, [state, toast, router]);

  return (
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" name="password" type="password" required />
          {state.errors?.password && (
            <p className="text-sm font-medium text-destructive">
              {state.errors.password[0]}
            </p>
          )}
        </div>
         <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
          {state.errors?.confirmPassword && (
            <p className="text-sm font-medium text-destructive">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>
  )
}


export function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Supabase sends an error in the URL if the link is expired/invalid
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
        toast({
            title: "Invalid Link",
            description: "The password reset link is invalid or has expired. Please request a new one.",
            variant: "destructive"
        });
        router.push('/forgot-password');
    }
  }, [searchParams, router, toast]);

  // This effect handles the session creation from the URL hash
  useEffect(() => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
        // The 'PASSWORD_RECOVERY' event fires when the user lands on this page
        // with a valid token in the URL hash. This creates a temporary session
        // which allows us to securely call `updateUser`.
        if (event === 'PASSWORD_RECOVERY') {
            console.log("Password recovery session established.");
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
         <div className="flex items-center justify-center gap-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">
                    Uptime Sentinel
                </span>
            </div>
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-balance text-muted-foreground">
          Enter a new password for your account.
        </p>
      </div>

      <PasswordForm />

      <div className="mt-4 text-center text-sm">
        Remember your password?{" "}
        <Link href="/login" className="underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
