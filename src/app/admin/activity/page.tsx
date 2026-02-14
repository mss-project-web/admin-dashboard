"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ArrowUpDown, MapPin, Calendar, Star, Loader2
} from "lucide-react";
import { activityService } from "@/services/activityService";
import { ActivityListItem } from "@/types/activity";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";

import ActivityModal from "./components/ActivityModal";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { Pagination, PaginationInfo } from "@/app/components/ui/Pagination";
import { TableSkeleton } from "@/app/components/ui/TableSkeleton";
import { SortableHeader, TableHeader } from "@/app/components/ui/SortableHeader";
import { FilterBar } from "@/app/components/ui/FilterBar";
import { PageHeader } from "@/app/components/ui/PageHeader";

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
    const [isDeleting, setIsDeleting] = useState(false);

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

    const confirmDelete = async () => {
        if (!activityToDelete) return;
        setIsDeleting(true);
        try {
            await activityService.delete(activityToDelete._id);
            setRefreshKey(prev => prev + 1);
            setIsDeleteModalOpen(false);
            setActivityToDelete(null);
        } catch (error) {
            console.error(error);
            setError("Failed to delete activity");
        } finally {
            setIsDeleting(false);
        }
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

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="ยืนยันการลบกิจกรรม"
                description="คุณแน่ใจหรือไม่ที่จะลบกิจกรรม"
                itemName={activityToDelete?.name_th || ""}
                isDeleting={isDeleting}
            />

            {/* Headers */}
            <PageHeader
                title="จัดการกิจกรรม"
                colorClass="bg-sky-500"
                action={{
                    label: "เพิ่มกิจกรรมใหม่",
                    onClick: handleAddClick
                }}
            />

            {/* Controls */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border-x border-t border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="ค้นหา ชื่อกิจกรรม, สถานที่..."
                        className="w-full lg:w-auto mb-0"
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={processedActivities.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mt-0">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <TableHeader label="รูปภาพ" className="w-20 text-center" />
                                <SortableHeader label="ชื่อกิจกรรม" sortKey="name_th" currentSort={sortConfig} onSort={requestSort} className="w-1/5" />
                                <SortableHeader label="รายละเอียด" sortKey="description" currentSort={sortConfig} onSort={requestSort} className="w-[30%] min-w-[300px]" />
                                <SortableHeader label="สถานที่" sortKey="location" currentSort={sortConfig} onSort={requestSort} />
                                <SortableHeader label="แนะนำ" sortKey="favorite" currentSort={sortConfig} onSort={requestSort} className="w-24 text-center" />
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <TableSkeleton columns={6} />
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

            <PaginationInfo totalItems={processedActivities.length} />
        </div>
    );
}
