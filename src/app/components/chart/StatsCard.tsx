import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: never;
  colorClass?: string;
  bgClass?: string;
}

export const StatsCard = ({ label, value, icon: Icon }: StatsCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-400" aria-hidden="true" />
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-slate-950 sm:text-3xl dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Total records</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900/50 dark:group-hover:bg-blue-900/60">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
  </div>
);
