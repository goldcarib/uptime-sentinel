
"use client";

import { useState } from "react";
import Link from 'next/link';
import { MoreHorizontal, Link as LinkIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { StatusPageDialog } from "./status-page-dialog";
import { deleteStatusPageAction } from "./actions";
import type { WebsiteWithStatusPage } from "@/lib/types";

export function StatusPagesClient({ sites }: { sites: WebsiteWithStatusPage[] }) {
  const [selectedSite, setSelectedSite] = useState<WebsiteWithStatusPage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEdit = (site: WebsiteWithStatusPage) => {
    setSelectedSite(site);
    setDialogOpen(true);
  };
  
  const handleAddNew = (site: WebsiteWithStatusPage) => {
    setSelectedSite(site);
    setDialogOpen(true);
  };

  const handleDelete = async (websiteId: number) => {
    const result = await deleteStatusPageAction(websiteId);
    toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Website</TableHead>
                <TableHead>Status Page</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>
                    <div className="font-medium">{site.name}</div>
                    <div className="text-sm text-muted-foreground">{site.url}</div>
                  </TableCell>
                  <TableCell>
                    {site.status_page?.is_public ? (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        <Link href={`/status/${site.status_page.slug}`} target="_blank" className="text-sm hover:underline">
                         /status/{site.status_page.slug}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <EyeOff className="h-4 w-4" />
                        <span className="text-sm">Disabled</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {site.status_page ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/status/${site.status_page.slug}`} target="_blank">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                View Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(site)}>
                            Edit Settings
                          </DropdownMenuItem>
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        Delete Page
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the status page for this website. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(site.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleAddNew(site)}>
                        Create Page
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedSite && (
        <StatusPageDialog
            site={selectedSite}
            open={dialogOpen}
            onOpenChange={(open) => {
                if (!open) setSelectedSite(null);
                setDialogOpen(open);
            }}
        />
      )}
    </>
  );
}
