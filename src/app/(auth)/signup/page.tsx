
"use client";

import { useActionState, useEffect, Suspense } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { signupAction } from "./actions";

const initialState = {
  message: null,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating Account..." : "Create Account"}
    </Button>
  );
}

function SignupForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    // Extract invitation details from URL
    const email = searchParams.get('email');
    const team_id = searchParams.get('team_id');
    const role = searchParams.get('role');

    const [state, formAction] = useActionState(signupAction, initialState);

    useEffect(() => {
        // Redirect if invitation details are missing
        if (!email || !team_id || !role) {
            toast({
                title: "Invalid Invitation",
                description: "The sign-up link is missing required information. Please use the link from your invitation email.",
                variant: "destructive",
            });
            router.push("/login");
        }
    }, [email, team_id, role, router, toast]);

    useEffect(() => {
        if (state.message) {
            toast({
                title: "Sign-up Failed",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, toast]);

    if (!email || !team_id || !role) {
        // Render nothing or a loading state while redirecting
        return null;
    }

    return (
         <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                 <div className="grid gap-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Icons.logo className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">
                            Uptime Sentinel
                        </span>
                    </div>
                    <p className="text-balance text-muted-foreground">
                        Create your password to join the team.
                    </p>
                </div>

                <form action={formAction} className="grid gap-4">
                    <input type="hidden" name="email" value={email} />
                    <input type="hidden" name="team_id" value={team_id} />
                    <input type="hidden" name="role" value={role} />
                    
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required placeholder="Must be at least 8 characters" />
                        {state?.errors?.password && (
                            <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>
                        )}
                    </div>
                    <SubmitButton />
                </form>
            </div>
         </div>
    )
}


export default function SignupPage() {
  return (
     <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <div className="hidden bg-muted lg:block">
            <Image
            src="https://picsum.photos/seed/signuppage/1280/1000"
            alt="Image"
            width="1280"
            height="1000"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint="abstract technology"
            />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
            <SignupForm />
        </Suspense>
    </div>
  );
}
