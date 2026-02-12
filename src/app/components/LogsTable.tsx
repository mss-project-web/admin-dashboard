"use client";
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Calendar, ArrowUpDown } from "lucide-react";
import { LogDetailModal } from './LogDetailModal';

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

interface LogsTableProps {
    logs: Log[];
}

export const LogsTable = ({ logs }: LogsTableProps) => {
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch =
                (log.details?.email?.toLowerCase().includes(search.toLowerCase())) ||
                (log.action.toLowerCase().includes(search.toLowerCase())) ||
                (log.resource.toLowerCase().includes(search.toLowerCase())) ||
                (log._id.toLowerCase().includes(search.toLowerCase()));

            const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, search, actionFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (log: Log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative w-full xl:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search logs (email, action, ID)..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Filter size={18} className="text-slate-400 ml-2" />
                        <select
                            className="flex-1 sm:w-40 px-3 py-1.5 rounded-xl bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="ALL">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="POST">Post</option>
                            <option value="PUT">Put</option>
                            <option value="DELETE">Delete</option>
                            <option value="Error">Error</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-5 font-bold tracking-wider text-slate-600 dark:text-slate-300">Time</th>
                                <th className="px-6 py-5 font-bold tracking-wider text-slate-600 dark:text-slate-300">User / IP</th>
                                <th className="px-6 py-5 font-bold tracking-wider text-slate-600 dark:text-slate-300">Action</th>
                                <th className="px-6 py-5 font-bold tracking-wider text-slate-600 dark:text-slate-300">Resource</th>
                                <th className="px-8 py-5 font-bold tracking-wider text-slate-600 dark:text-slate-300 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {paginatedLogs.map((log) => (
                                <tr
                                    key={log._id}
                                    onClick={() => handleRowClick(log)}
                                    className="group hover:bg-sky-50/30 dark:hover:bg-slate-800/40 transition-all duration-200 cursor-pointer"
                                >
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(log.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400 mt-1">
                                                {new Date(log.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {log.details?.email || 'Anonymous'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {log.ip}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm
                                            ${log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                log.action === 'Error' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                                                    'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700/50">
                                            {log.resource}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-sky-500 transition-all shadow-none hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedLogs.map((log) => (
                        <div
                            key={log._id}
                            onClick={() => handleRowClick(log)}
                            className="p-5 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                                        {log.details?.email || 'Anonymous'}
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border
                                        ${log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            log.action === 'Error' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400' :
                                                'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400'}`}>
                                        {log.action}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {new Date(log.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                        {new Date(log.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-3 mt-3 border-t border-slate-50 dark:border-slate-800/50">
                                <span className="text-slate-500 font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                    {log.resource}
                                </span>
                                <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600">
                                    {log.ip}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {paginatedLogs.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No logs found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="text-xs font-medium text-slate-500">
                            Rows per page
                        </div>
                        <select
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-xs text-slate-500">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filteredLogs.length}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 transition-colors shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 transition-colors shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <LogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};
