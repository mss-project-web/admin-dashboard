import { LucideIcon, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    icon?: LucideIcon; // Optional icon next to title
    colorClass?: string; // e.g. "bg-sky-500" for the accent pill
    action?: {
        label: string;
        icon?: LucideIcon;
        onClick?: () => void;
        href?: string; // If href is provided, it renders as Link, otherwise button
    };
    children?: React.ReactNode; // For additional header content like Bulk Actions
}

export function PageHeader({ title, icon: Icon, colorClass = "bg-primary", action, children }: PageHeaderProps) {
    const ActionIcon = action?.icon || Plus;

    return (
        <div className="flex items-center justify-between px-1 mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className={cn("w-1.5 h-6 rounded-full", colorClass)} />
                    {Icon && <Icon size={24} className={cn("mr-1", colorClass.replace('bg-', 'text-'))} />}
                    {title}
                </h2>
            </div>

            <div className="flex gap-2 items-center">
                {children}

                {action && (
                    <>
                        {action.href ? (
                            <Link
                                href={action.href}
                                className={cn(
                                    "cursor-pointer flex items-center gap-1.5 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95",
                                    colorClass,
                                    "hover:opacity-90"
                                )}
                            >
                                <ActionIcon size={16} />
                                <span className="inline sm:hidden">เพิ่ม</span>
                                <span className="hidden sm:inline">{action.label}</span>
                            </Link>
                        ) : (
                            <button
                                onClick={action.onClick}
                                className={cn(
                                    "cursor-pointer flex items-center gap-1.5 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95",
                                    colorClass,
                                    "hover:opacity-90"
                                )}
                            >
                                <ActionIcon size={16} />
                                <span className="inline sm:hidden">เพิ่ม</span>
                                <span className="hidden sm:inline">{action.label}</span>
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
