"use client";
import React, { useEffect, useState } from "react";
import { systemLogsService } from "@/services/systemLogsService";
import { LogsTable } from "@/app/components/LogsTable";
import { toastUtils } from "@/lib/toast";
import { RotateCw, ShieldAlert, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SystemLogsPage() {
    const { isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            toastUtils.error("Access Denied", "You do not have permission to view system logs.");
            router.push("/admin");
        }
    }, [authLoading, isSuperAdmin, router]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await systemLogsService.getAll();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch system logs:", error);
            toastUtils.error("Error", "Failed to load system logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchLogs();
        }
    }, [isSuperAdmin]);

    if (authLoading) {
        return null; // Or a global loading spinner
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="h-20 w-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} className="text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Only administrators with <strong>Super Admin</strong> privileges can view system logs.
                </p>
                <button
                    onClick={() => router.push("/admin")}
                    className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                            <ShieldAlert className="text-sky-600 dark:text-sky-400" size={24} />
                        </div>
                        System Logs
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 ml-1 text-sm">
                        Monitor system activities, security events, and user actions in real-time.
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50 shadow-sm hover:shadow-md font-medium"
                >
                    <RotateCw size={18} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {loading && logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading system records...</p>
                </div>
            ) : (
                <div className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl rounded-[2.5rem] p-1 border border-white/20 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
                    <LogsTable logs={logs} />
                </div>
            )}
        </div>
    );
}
