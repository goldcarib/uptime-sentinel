
"use client";

import { useEffect, type ReactNode } from "react";
import { redirect, useRouter } from 'next/navigation';
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { UserNav } from "@/components/layout/user-nav";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderSkeleton } from "./header-skeleton";
import { Chat } from "@/components/chat/chat";

function AppErrorFallback({ error, message }: { error?: any, message?: string }) {
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/50 bg-card p-8 text-center shadow-lg">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
          <p className="max-w-md text-muted-foreground">
            {message || "We're sorry, but the application could not start. This is likely due to a problem connecting to the database or loading your profile. Please check the service status and try again later."}
          </p>
           <code className="mt-2 text-xs text-muted-foreground/70 bg-muted/50 p-2 rounded-md">
            {errorMessage}
          </code>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
      </div>
    </div>
  )
}

export function MainLayoutClient({
  children,
  header
}: {
  children: React.ReactNode;
  header: ReactNode;
}) {
  const { user, profile, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!isLoading && !user) {
      redirect("/login");
    }
     // On initial load, if the user is signed in but the profile is still loading,
     // router.refresh() can help sync server/client state if needed after auth resolves.
     if (!isLoading && user && !profile) {
        router.refresh();
     }
  }, [isLoading, user, profile, router]);
  
  // This is the first and most important check. If an error was caught anywhere
  // in the provider (e.g., fetching session), show the fallback.
  if (error) {
    return <AppErrorFallback error={error} message="There was a problem loading your user profile. This could be due to a network issue or inconsistent data in the database." />
  }

  // Show a skeleton loader ONLY during the initial load sequence.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:block md:w-64 border-r p-4">
            <Skeleton className="h-8 w-3/g" />
            <div className="mt-8 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="flex-1 flex flex-col">
             <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
                <HeaderSkeleton />
            </header>
            <main className="p-8 flex-1">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
      </div>
    )
  }

  // If we are done loading but have no user, or profile, redirect. The useEffect handles this,
  // but rendering null prevents a flash of un-styled content while the redirect is happening.
  if (!user || !profile) {
      return null;
  }

  // If loading is done, and we have a user and a profile, we can render the app.
  return (
      <SidebarProvider>
      <Sidebar>
          <MainNav />
      </Sidebar>
      <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-6">
              {header}
              <UserNav />
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          <Chat />
      </SidebarInset>
      </SidebarProvider>
  );
}
