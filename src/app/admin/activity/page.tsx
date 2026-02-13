"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, MapPin, Calendar, Star, Loader2, Download
} from "lucide-react";
import { activityService } from "@/services/activityService";
import { ActivityListItem } from "@/types/activity";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";

import ActivityModal from "./components/ActivityModal";
import DeleteActivityModal from "./components/DeleteActivityModal";

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityListItem; direction: 'asc' | 'desc' | null }>({ key: 'name_th', direction: 'asc' });

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<ActivityListItem | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<ActivityListItem | null>(null);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await activityService.getAll();
            setActivities(data);
        } catch (err) {
            console.error("Failed to fetch activities:", err);
            setError("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [refreshKey]);

    const handleAddClick = () => {
        setSelectedActivity(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (activity: ActivityListItem) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (activity: ActivityListItem) => {
        setActivityToDelete(activity);
        setIsDeleteModalOpen(true);
    };

    const processedActivities = useMemo(() => {
        let items = [...activities].filter(a =>
            a.name_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.name_eng.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.direction !== null) {
            items.sort((a, b) => {
                // @ts-ignore - dynamic key access
                const aValue = a[sortConfig.key] || "";
                // @ts-ignore
                const bValue = b[sortConfig.key] || "";

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [activities, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedActivities.length / itemsPerPage);
    const currentItems = processedActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key: keyof ActivityListItem) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
        setSortConfig({ key, direction });
    };

    const favoriteCount = useMemo(() => activities.filter(a => a.favorite).length, [activities]);

    return (
        <div className="w-full space-y-4 pb-32">
            <ActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsModalOpen(false); }}
                activityToEdit={selectedActivity}
                currentFavoriteCount={favoriteCount}
            />

            <DeleteActivityModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsDeleteModalOpen(false); }}
                activityToDelete={activityToDelete}
            />

            {/* Headers */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        จัดการกิจกรรม
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button className="cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all">
                        <Download size={14} />
                        <span className="inline">Export</span>
                    </button>
                    <button
                        onClick={handleAddClick}
                        className="cursor-pointer flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="inline sm:hidden">เพิ่ม</span>
                        <span className="hidden sm:inline">เพิ่มกิจกรรมใหม่</span>
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="ค้นหา ชื่อกิจกรรม, สถานที่..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span>แสดง:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sky-600 outline-none"
                            >
                                {[10, 20, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronsLeft size={16} /></button>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <span className="mx-2 text-xs font-bold text-sky-600">หน้า {currentPage} / {totalPages || 1}</span>
                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronRight size={16} /></button>
                            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronsRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-3 w-20 text-center">รูปภาพ</th>
                                <th onClick={() => requestSort('name_th')} className="px-6 py-3 w-1/5 cursor-pointer hover:bg-sky-50 transition-colors text-sky-600">ชื่อกิจกรรม <ArrowUpDown size={10} className="inline ml-1" /></th>
                                <th onClick={() => requestSort('description')} className="px-6 py-3 w-[30%] min-w-[300px] cursor-pointer hover:bg-sky-50 transition-colors">รายละเอียด</th>
                                <th onClick={() => requestSort('location')} className="px-6 py-3 cursor-pointer hover:bg-sky-50 transition-colors">สถานที่</th>
                                <th onClick={() => requestSort('favorite')} className="px-6 py-3 w-24 text-center cursor-pointer hover:bg-sky-50 transition-colors">แนะนำ</th>
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-6 py-4"><Skeleton className="h-10 w-16 rounded-md" /></td>
                                        <td className="px-6 py-4">
                                            <Skeleton className="h-4 w-3/4 mb-1" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                                        <td className="px-6 py-4"><div className="flex gap-1"><Skeleton className="h-4 w-4" /><Skeleton className="h-4 w-24" /></div></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-red-500">{error}</td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-400">ไม่พบกิจกรรม</td>
                                </tr>
                            ) : (
                                currentItems.map((activity, index) => (
                                    <tr
                                        key={activity._id}
                                        className={`group transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'} hover:bg-sky-50`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="h-10 w-16 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                                {activity.images ? (
                                                    <Image
                                                        src={activity.images}
                                                        alt={activity.name_th}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300"><Calendar size={16} /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{activity.name_th}</div>
                                                <div className="text-[10px] text-slate-400 line-clamp-1">{activity.name_eng}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="line-clamp-2">{activity.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={12} className="text-sky-400 shrink-0" />
                                                <span className="truncate max-w-[200px]">{activity.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {activity.favorite ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-50 text-yellow-500">
                                                    <Star size={14} fill="currentColor" />
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right pr-8 sticky right-0 z-10 border-l border-slate-100 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'} group-hover:bg-sky-50 dark:group-hover:bg-slate-800`}>
                                            <div className="flex justify-end gap-1.5 relative z-20">
                                                <button onClick={() => handleEditClick(activity)} className="cursor-pointer p-1.5 text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteClick(activity)} className="cursor-pointer p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records: {processedActivities.length}</span>
            </div>
        </div>
    );
}
