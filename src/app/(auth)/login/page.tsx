
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";


const initialState = {
  message: null,
  errors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && (state.errors || state.message.includes("Could not authenticate"))) {
      toast({
        title: "Login Failed",
        description: state.message,
        variant: "destructive",
      });
    } else if (state.message?.includes("Welcome back!")) {
        toast({ title: "Welcome back!", description: "You are now logged in." });
        // Success - redirect manually
        router.push("/");
    }
  }, [state, toast, router]);

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/picsum/1280/1000"
          alt="Image"
          width="1280"
          height="1000"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="abstract texture"
        />
      </div>
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
              Enter your email and password to login. New users must be invited by a team admin.
            </p>
          </div>
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                 <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
               {state.errors?.password && (
                  <p className="text-sm font-medium text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
            </div>
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
