"use client";
import React, { useEffect, useState } from "react";
import { systemApi } from "@/lib/api/system";
import { LogsTable } from "@/app/components/LogsTable";
import { toastUtils } from "@/lib/toast";
import { RotateCw, ShieldAlert } from "lucide-react";

export default function SystemLogsPage() {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await systemApi.getSystemLogs();
            const data = response?.data?.data || response?.data || [];

            const sortedData = Array.isArray(data) ? data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ) : [];

            setLogs(sortedData);
        } catch (error) {
            console.error("Failed to fetch system logs:", error);
            toastUtils.error("Error", "Failed to load system logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        System Logs
                        <ShieldAlert className="text-sky-500" size={24} />
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Monitor system activities, security events, and user actions.
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                    <RotateCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {loading && logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500 mb-4"></div>
                    <p className="text-slate-400">Loading system records...</p>
                </div>
            ) : (
                <div className="p-1 rounded-[2rem]">
                    <LogsTable logs={logs} />
                </div>
            )}
        </div>
    );
}
