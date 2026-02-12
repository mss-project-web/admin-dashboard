import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  colorClass: string;
  bgClass: string;
}

export const StatsCard = ({ label, value, icon: Icon, trend, colorClass, bgClass }: StatsCardProps) => (
  <div className="group relative overflow-hidden rounded-[2rem] border border-sky-100/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-100/50 dark:hover:shadow-sky-900/20">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgClass} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-500`} />

    <div className="relative flex items-center justify-between mb-4">
      <div className={`rounded-2xl ${bgClass} p-3.5 transition-colors duration-300 group-hover:bg-white dark:group-hover:bg-slate-800`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      {trend && (
        <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-100 dark:border-sky-500/20">
          {trend}
        </span>
      )}
    </div>

    <div className="relative">
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    </div>
  </div>
);