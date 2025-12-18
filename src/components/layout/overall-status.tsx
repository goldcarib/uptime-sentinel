
import { Separator } from "@/components/ui/separator";
import { ServerCrash, Clock, CalendarDays, Calendar, Activity } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

type OverallStats = {
    total_sites: number;
    sites_down: number;
    uptime_24h: number;
    uptime_7d: number;
    uptime_30d: number;
    uptime_365d: number;
}


export async function OverallStatus({ supabase }: { supabase: SupabaseClient }) {
    
    let data;
    try {
        const result = await supabase.rpc('get_overall_uptime_stats').single<OverallStats>();
        if (result.error) throw result.error;
        data = result.data;
    } catch (error) {
        console.error("Error fetching overall stats:", error);
        // Render a fallback or error state for the header
        return (
             <div className="flex items-center gap-6 h-full text-sm text-muted-foreground">
                Could not load overall stats.
            </div>
        )
    }

    if (!data) {
        return (
             <div className="flex items-center gap-6 h-full text-sm text-muted-foreground">
                No stats available.
            </div>
        )
    }


    const formatUptime = (uptime: number) => {
        if (uptime >= 99.995) return "100";
        return uptime.toFixed(2);
    }

    const uptimeStats = [
        { period: "24h", value: formatUptime(data.uptime_24h), icon: <Activity /> },
        { period: "7d", value: formatUptime(data.uptime_7d), icon: <CalendarDays /> },
        { period: "30d", value: formatUptime(data.uptime_30d), icon: <Calendar /> },
        { period: "365d", value: formatUptime(data.uptime_365d), icon: <Clock /> },
    ];


    return (
        <div className="flex items-center gap-4 lg:gap-6 h-full">
            <div className="flex items-center gap-3">
                <ServerCrash className="h-5 w-5 text-destructive" />
                <div>
                    <p className="text-sm text-muted-foreground">Current Issues</p>
                    <p className="text-lg font-bold leading-tight">{data.sites_down}</p>
                </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-4 lg:gap-6">
                {uptimeStats.map(stat => (
                    <div key={stat.period} className="flex items-center gap-3">
                        <div className="text-muted-foreground">{stat.icon}</div>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.period} Uptime</p>
                            <p className="text-lg font-bold leading-tight">{stat.value}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
