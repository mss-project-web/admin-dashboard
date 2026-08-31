"use client";
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, User } from "lucide-react";
import { LogDetailModal } from './LogDetailModal';

interface Log {
    _id: string;
    action: string;
    resource: string;
    userId?: string;
    details: {
        email?: string;
        [key: string]: any;
    };
    ip: string;
    createdAt: string;
    _user?: {
        email: string;
        firstName: string;
        lastName: string;
    } | null;
}

interface LogsTableProps {
    logs: Log[];
}

const ACTION_COLORS: Record<string, string> = {
    LOGIN:   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40',
    LOGOUT:  'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    POST:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/40',
    PUT:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40',
    DELETE:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/40',
    Error:   'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
};

function getActionColor(action: string) {
    return ACTION_COLORS[action] ?? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/40';
}

function UserAvatar({ user, email }: { user?: Log['_user']; email?: string }) {
    const name = user ? `${user.firstName} ${user.lastName}`.trim() : null;
    const displayEmail = user?.email || email;
    const initials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || '??'
        : email?.charAt(0).toUpperCase() || '?';

    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-violet-100 text-violet-600',
        'bg-emerald-100 text-emerald-600',
        'bg-amber-100 text-amber-600',
        'bg-rose-100 text-rose-600',
    ];
    const colorIndex = (displayEmail?.charCodeAt(0) || 0) % colors.length;

    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border ${colors[colorIndex]} border-white shadow-sm`}>
                {initials}
            </div>
            <div className="min-w-0">
                {name ? (
                    <>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{name}</div>
                        <div className="text-xs text-slate-400 truncate">{displayEmail || '-'}</div>
                    </>
                ) : displayEmail ? (
                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{displayEmail}</div>
                ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <User size={12} />
                        <span>Anonymous</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export const LogsTable = ({ logs }: LogsTableProps) => {
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const userEmail = log._user?.email || log.details?.email || '';
            const userName = log._user ? `${log._user.firstName} ${log._user.lastName}` : '';
            const q = search.toLowerCase();

            const matchesSearch = !q ||
                userEmail.toLowerCase().includes(q) ||
                userName.toLowerCase().includes(q) ||
                log.action.toLowerCase().includes(q) ||
                log.resource.toLowerCase().includes(q) ||
                log._id.toLowerCase().includes(q);

            const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
            return matchesSearch && matchesAction;
        });
    }, [logs, search, actionFilter]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const uniqueActions = useMemo(() => [...new Set(logs.map(l => l.action))].sort(), [logs]);

    const handleRowClick = (log: Log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4 pb-16">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
                    {/* Search */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, อีเมล, action, resource..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                        {/* Action Filter */}
                        <select
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">ทุก Action</option>
                            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>

                        {/* Items per page */}
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span>แสดง:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sky-600 outline-none cursor-pointer"
                            >
                                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronsLeft size={15} /></button>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronLeft size={15} /></button>
                            <span className="mx-2 text-xs font-bold text-sky-600 whitespace-nowrap">หน้า {currentPage} / {totalPages || 1}</span>
                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronRight size={15} /></button>
                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronsRight size={15} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="px-5 py-3.5 w-44">เวลา</th>
                                <th className="px-5 py-3.5">ผู้ใช้งาน</th>
                                <th className="px-5 py-3.5 w-28 text-center">Action</th>
                                <th className="px-5 py-3.5">Resource</th>
                                <th className="px-5 py-3.5 w-32 text-center">IP Address</th>
                                <th className="px-5 py-3.5 w-20 text-right pr-6 sticky right-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800/60">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="text-slate-200 dark:text-slate-700" size={36} />
                                            <span className="font-medium">ไม่พบข้อมูล Log</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <tr
                                        key={log._id}
                                        onClick={() => handleRowClick(log)}
                                        className={`group transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30'} hover:bg-sky-50/50 dark:hover:bg-slate-800/30`}
                                    >
                                        {/* Time */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                                                {new Date(log.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                {new Date(log.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                        </td>

                                        {/* User */}
                                        <td className="px-5 py-3.5 max-w-[220px]">
                                            <UserAvatar user={log._user} email={log.details?.email} />
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>

                                        {/* Resource */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-700/50 truncate max-w-[240px] block">
                                                {log.resource}
                                            </span>
                                        </td>

                                        {/* IP */}
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="text-xs font-mono text-slate-400">{log.ip || '-'}</span>
                                        </td>

                                        {/* Details */}
                                        <td className={`px-5 py-3.5 text-right pr-6 sticky right-0 border-l border-slate-100 dark:border-slate-800/50 transition-colors shadow-[-4px_0_8px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30'} group-hover:bg-sky-50/50 dark:group-hover:bg-slate-800/30`}>
                                            <button className="p-1.5 text-slate-300 group-hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/20 rounded-lg border border-transparent group-hover:border-sky-200 dark:group-hover:border-sky-800 transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold text-slate-400 shadow-sm">
                <span>แสดง {paginatedLogs.length} รายการ</span>
                <span className="uppercase tracking-widest">พบทั้งหมด {filteredLogs.length.toLocaleString()} รายการ</span>
            </div>

            <LogDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
};
