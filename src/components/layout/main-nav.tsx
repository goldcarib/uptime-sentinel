
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, ShieldAlert, FileText, Users, Plug, StickyNote } from "lucide-react";

import { Icons } from "@/components/icons";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import type { AppRole } from "@/lib/types";

// Roles are now context-dependent (per-team), so we simplify the nav.
// A user is either a MEMBER or an ADMIN in at least one team.
// We can check if they have any ADMIN roles to show admin-only links.
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert, adminOnly: false },
  { href: "/notes", label: "Notes", icon: StickyNote, adminOnly: false },
  { href: "/status-pages", label: "Status Pages", icon: FileText, adminOnly: false },
  { href: "/team-members", label: "Team Members", icon: Users, adminOnly: true },
  { href: "/integrations", label: "Integrations", icon: Plug, adminOnly: false },
];

export function MainNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  // The user has an ADMIN role if they are an admin in at least one team.
  const isAtLeastAdmin = profile?.teams.some(team => team.role === 'ADMIN') ?? false;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">
            Uptime Sentinel
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.filter(item => !item.adminOnly || isAtLeastAdmin).map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {isAtLeastAdmin && (
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                        <Link href="/settings">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
        <div className="flex flex-col p-4 gap-2 items-start text-sidebar-foreground/70">
            <span className="text-xs">Powered By</span>
             <a href="https://sightfactory.com" target="_blank" rel="noopener noreferrer">
                <Image 
                    src="https://sightfactory.com/wp-content/uploads/2022/04/anniversary-logo-w.png" 
                    alt="Sightfactory Logo" 
                    width={150} 
                    height={38} 
                    className="opacity-80 hover:opacity-100 transition-opacity"
                />
             </a>
        </div>
      </SidebarFooter>
    </>
  );
}
