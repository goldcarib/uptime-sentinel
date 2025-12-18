import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uptime Sentinel",
  description: "Monitor website uptime and get notified on incidents.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      {children}
    </main>
  );
}
