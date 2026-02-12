"use client";
import React from 'react';

interface Log {
    _id: string;
    action: string;
    resource: string;
    details: {
        email?: string;
        [key: string]: any;
    };
    ip: string;
    createdAt: string;
}

interface RecentLogsTableProps {
    logs: Log[];
}

const getActionColor = (action: string) => {
    switch (action) {
        case 'LOGIN': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
        case 'Error': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
        default: return 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20';
    }
};

export const RecentLogsTable = ({ logs }: RecentLogsTableProps) => {
    return (
        <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold rounded-l-xl">User</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Action</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Resource</th>
                            <th scope="col" className="px-6 py-4 font-semibold rounded-r-xl">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.map((log) => (
                            <tr key={log._id} className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span>{log.details.email || 'Unknown'}</span>
                                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ip}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    {log.resource}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">
                                    {new Date(log.createdAt).toLocaleString('th-TH', {
                                        day: '2-digit', month: '2-digit', year: '2-digit',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {logs.map((log) => (
                    <div key={log._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{log.details.email || 'Unknown'}</h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ip}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                                {log.action}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                            <span>{log.resource}</span>
                            <span className="font-mono">
                                {new Date(log.createdAt).toLocaleString('th-TH', {
                                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {logs.length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">No recent logs found.</div>
            )}
        </div>
    );
};
