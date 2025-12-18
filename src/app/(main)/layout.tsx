
import { Suspense } from "react";
import { cookies } from "next/headers";
import { OverallStatus } from "@/components/layout/overall-status";
import { HeaderSkeleton } from "./header-skeleton";
import { MainLayoutClient } from "./main-layout-client";
import { createSupabaseServerClient } from "@/lib/supabase-server";


export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  const header = (
    <div className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-6">
        <Suspense fallback={<HeaderSkeleton />}>
            {/* @ts-ignore */}
            <OverallStatus supabase={supabase} />
        </Suspense>
    </div>
  )

  return (
    <MainLayoutClient header={header}>
      {children}
    </MainLayoutClient>
  );
}
