"use client";
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
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
        <div className="space-y-4 pb-32">
            {/* Toolbar */}
            <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search logs (email, action, ID)..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-sky-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto justify-between sm:justify-end lg:justify-end">
                        {/* Action Filter */}
                        <div className="flex items-center gap-2">
                            <select
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
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

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span>แสดง:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sky-600 outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span className="mx-2 text-xs font-bold text-sky-600">
                                หน้า {currentPage} / {totalPages || 1}
                            </span>

                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(totalPages)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-3 w-40">Time</th>
                                <th className="px-6 py-3">User / IP</th>
                                <th className="px-6 py-3 w-32">Action</th>
                                <th className="px-6 py-3">Resource</th>
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="text-slate-300 mb-2" size={32} />
                                            <span>No logs found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={log._id}
                                        onClick={() => handleRowClick(log)}
                                        className={`group transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'
                                            } hover:bg-sky-50/30`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                    {new Date(log.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs font-mono text-slate-400 mt-1">
                                                    {new Date(log.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {log.details?.email || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {log.ip}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase border
                                                ${log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                    log.action === 'Error' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400' :
                                                        'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700/50">
                                                {log.resource}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right pr-8 sticky right-0 border-l border-slate-100 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'
                                            } group-hover:bg-sky-50 dark:group-hover:bg-slate-800`}>
                                            <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Total Records Footer */}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records Found: {filteredLogs.length}</span>
            </div>

            <LogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};
