import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    children?: React.ReactNode; // For additional filters (selects, buttons, etc.)
}

export function FilterBar({
    searchTerm,
    onSearchChange,
    placeholder = "ค้นหา...",
    className,
    children
}: FilterBarProps) {
    return (
        <div className={cn("top-0 z-0 mb-4", className)}>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

                {/* Search & Filter Group */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto flex-1">
                    {/* Search Field */}
                    <div className="relative flex-1 min-w-[200px] lg:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Additional Filters Slot */}
                    {children}
                </div>
            </div>
        </div>
    );
}

// Reusable Filter Select Component to ensure consistent styling
interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
    defaultLabel?: string;
    className?: string; // Add className prop
}

export function FilterSelect({ value, onChange, options, icon, defaultLabel = "ทั้งหมด", className }: FilterSelectProps) {
    return (
        <div className={cn("flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2", className)}>
            {icon}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent border-none text-xs outline-none text-slate-700 dark:text-slate-200 min-w-[80px]"
            >
                <option value="">{defaultLabel}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
