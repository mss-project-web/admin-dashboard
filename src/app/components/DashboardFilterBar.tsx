"use client";
import { useState, useMemo, useEffect } from "react";
import { Calendar, Filter } from "lucide-react";

interface DashboardFilterBarProps {
    onFilterChange: (startDate?: string, endDate?: string) => void;
}

type RangeId = "today" | "7d" | "30d" | "ytd" | "all";

/** Compute stable ISO date strings for a given range *at component mount time*. */
function computeRange(range: RangeId, mountNow: number): { start?: string; end?: string } {
    const now = new Date(mountNow);
    switch (range) {
        case "today": {
            const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            return { start: start.toISOString(), end: end.toISOString() };
        }
        case "7d": {
            const start = new Date(mountNow - 7 * 24 * 60 * 60 * 1000);
            return { start: start.toISOString() };
        }
        case "30d": {
            const start = new Date(mountNow - 30 * 24 * 60 * 60 * 1000);
            return { start: start.toISOString() };
        }
        case "ytd": {
            const start = new Date(now.getFullYear(), 0, 1);
            return { start: start.toISOString() };
        }
        default:
            return {};
    }
}

export const DashboardFilterBar = ({ onFilterChange }: DashboardFilterBarProps) => {
    // Stable epoch captured once at mount — avoids new Date() drift on re-renders
    const mountNow = useMemo(() => Date.now(), []);

    const [selectedRange, setSelectedRange] = useState<RangeId>("all");

    useEffect(() => {
        const initial = computeRange("all", mountNow);
        onFilterChange(initial.start, initial.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRangeChange = (range: RangeId) => {
        setSelectedRange(range);
        const { start, end } = computeRange(range, mountNow);
        onFilterChange(start, end);
    };

    return (
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                <Filter size={18} className="text-blue-600 dark:text-blue-500" />
                <span>Dashboard Control Panel</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    {([
                        { id: "today" as RangeId, label: "Today" },
                        { id: "7d"   as RangeId, label: "7 Days" },
                        { id: "30d"  as RangeId, label: "30 Days" },
                        { id: "ytd"  as RangeId, label: "YTD" },
                        { id: "all"  as RangeId, label: "All Time" }
                    ]).map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => handleRangeChange(btn.id)}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                                selectedRange === btn.id
                                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-400">
                    <Calendar size={18} />
                </div>
            </div>
        </div>
    );
};
