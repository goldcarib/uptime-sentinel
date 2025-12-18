
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6 h-full">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-5 w-8" />
                    </div>
                </div>
                 <Skeleton className="h-8 w-px" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </div>
             <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    )
}
