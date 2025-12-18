
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordAction } from "./actions";
import { Icons } from "@/components/icons";

const initialState = {
  message: null,
  success: false,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending Link..." : "Send Password Reset Link"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Check Your Email" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
           <div className="flex items-center justify-center gap-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">
                    Uptime Sentinel
                </span>
            </div>
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
        {state.success ? (
             <div className="text-center text-green-500">
                <p>A password reset link has been sent to your email address. Please check your inbox.</p>
             </div>
        ) : (
            <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                />
                {state.errors?.email && (
                    <p className="text-sm font-medium text-destructive">
                    {state.errors.email[0]}
                    </p>
                )}
            </div>
            <SubmitButton />
            </form>
        )}
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
