
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export function Forbidden({ message, detectedIp }: { message: string, detectedIp?: string }) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{message}</p>
                    {detectedIp && (
                        <div className="mt-4 text-sm text-foreground">
                            Your detected IP address is: <code className="font-mono bg-muted/50 p-1 rounded-sm">{detectedIp}</code>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mt-8">
                        <Icons.logo className="h-6 w-6" />
                        <span className="text-sm">Powered by Uptime Sentinel</span>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
