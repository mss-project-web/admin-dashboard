import { Skeleton } from "@/app/components/ui/skeleton";

function PanelSkeleton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
            {children}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <PanelSkeleton className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
        </PanelSkeleton>
    );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: rows }, (_, index) => (
                <div className="flex items-center gap-3" key={index}>
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-3 w-2/5" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton({ showCloudflare = false }: { showCloudflare?: boolean }) {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดแดชบอร์ด">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-full sm:w-40" />
            </div>

            <PanelSkeleton className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex gap-2 overflow-hidden">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton className="h-8 w-20 shrink-0" key={index} />
                    ))}
                </div>
            </PanelSkeleton>

            {showCloudflare && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {Array.from({ length: 3 }, (_, index) => (
                        <PanelSkeleton className="space-y-3 p-4" key={index}>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </PanelSkeleton>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }, (_, index) => (
                    <PanelSkeleton className="space-y-4" key={index}>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-16" />
                    </PanelSkeleton>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                    <PanelSkeleton className="space-y-4" key={index}>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    </PanelSkeleton>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <PanelSkeleton className="space-y-4">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                </PanelSkeleton>
                {Array.from({ length: 2 }, (_, index) => (
                    <PanelSkeleton className="space-y-4" key={index}>
                        <Skeleton className="h-5 w-40" />
                        <ListSkeleton rows={4} />
                    </PanelSkeleton>
                ))}
            </div>

            <PanelSkeleton className="space-y-4">
                <Skeleton className="h-5 w-48" />
                <ListSkeleton rows={5} />
            </PanelSkeleton>
        </div>
    );
}
