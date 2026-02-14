"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ArrowUpDown, MapPin, Loader2, Building
} from "lucide-react";
import { prayerRoomService } from "@/services/prayerRoomService";
import { PrayerRoom } from "@/types/prayer-room";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";

import PrayerRoomModal from "./components/PrayerRoomModal";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { Pagination, PaginationInfo } from "@/app/components/ui/Pagination";
import { TableSkeleton } from "@/app/components/ui/TableSkeleton";
import { SortableHeader, TableHeader } from "@/app/components/ui/SortableHeader";
import { FilterBar } from "@/app/components/ui/FilterBar";
import { PageHeader } from "@/app/components/ui/PageHeader";

export default function PrayerRoomsPage() {
    const [prayerRooms, setPrayerRooms] = useState<PrayerRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof PrayerRoom; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrayerRoom, setSelectedPrayerRoom] = useState<PrayerRoom | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [prayerRoomToDelete, setPrayerRoomToDelete] = useState<PrayerRoom | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPrayerRooms = async () => {
        try {
            setLoading(true);
            const data = await prayerRoomService.getAll();
            setPrayerRooms(data);
        } catch (err) {
            console.error("Failed to fetch prayer rooms:", err);
            setError("Failed to load prayer rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrayerRooms();
    }, [refreshKey]);

    const handleAddClick = () => {
        setSelectedPrayerRoom(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (room: PrayerRoom) => {
        setSelectedPrayerRoom(room);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (room: PrayerRoom) => {
        setPrayerRoomToDelete(room);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!prayerRoomToDelete) return;
        setIsDeleting(true);
        try {
            await prayerRoomService.delete(prayerRoomToDelete._id as string);
            setRefreshKey(prev => prev + 1);
            setIsDeleteModalOpen(false);
            setPrayerRoomToDelete(null);
        } catch (error) {
            console.error(error);
            setError("Failed to delete prayer room");
        } finally {
            setIsDeleting(false);
        }
    };

    const processedRooms = useMemo(() => {
        let items = [...prayerRooms].filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.detail.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.direction !== null) {
            items.sort((a, b) => {
                // @ts-ignore
                const aValue = a[sortConfig.key] || "";
                // @ts-ignore
                const bValue = b[sortConfig.key] || "";

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [prayerRooms, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedRooms.length / itemsPerPage);
    const currentItems = processedRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key: keyof PrayerRoom) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full space-y-4 pb-32">
            <PrayerRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsModalOpen(false); }}
                prayerRoomToEdit={selectedPrayerRoom}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="ยืนยันการลบห้องละหมาด"
                description="คุณแน่ใจหรือไม่ที่จะลบห้องละหมาด"
                itemName={prayerRoomToDelete?.name || ""}
                isDeleting={isDeleting}
            />

            {/* Headers */}
            <PageHeader
                title="จัดการห้องละหมาด"
                colorClass="bg-emerald-500"
                action={{
                    label: "เพิ่มห้องละหมาด",
                    onClick: handleAddClick
                }}
            />

            {/* Controls */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="ค้นหา ชื่อ, สถานที่, รายละเอียด..."
                        className="w-full lg:w-auto mb-0"
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={processedRooms.length}
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
                                <SortableHeader label="ชื่อห้องละหมาด" sortKey="name" currentSort={sortConfig} onSort={requestSort} className="w-1/5" />
                                <SortableHeader label="สถานที่ตั้ง" sortKey="place" currentSort={sortConfig} onSort={requestSort} className="w-[20%]" />
                                <TableHeader label="รายละเอียด" className="w-[25%]" />
                                <TableHeader label="สิ่งอำนวยความสะดวก" className="w-[15%]" />
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
                                    <td colSpan={6} className="text-center py-10 text-slate-400">ไม่พบข้อมูลห้องละหมาด</td>
                                </tr>
                            ) : (
                                currentItems.map((room, index) => (
                                    <tr
                                        key={room._id}
                                        className={`group transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'} hover:bg-emerald-50`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="h-10 w-16 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                                {room.images && room.images.length > 0 ? (
                                                    <Image
                                                        src={room.images[0]}
                                                        alt={room.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300"><Building size={16} /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{room.name}</div>
                                            {room.faculty && <div className="text-[10px] text-slate-400 line-clamp-1">{room.faculty}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={12} className="text-emerald-400 shrink-0" />
                                                <span className="truncate">{room.place}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="line-clamp-2">{room.detail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex flex-wrap gap-1">
                                                {room.facilities?.slice(0, 2).map((item, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                                        {item}
                                                    </span>
                                                ))}
                                                {room.facilities?.length > 2 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{room.facilities.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right pr-8 sticky right-0 z-10 border-l border-slate-100 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'} group-hover:bg-emerald-50 dark:group-hover:bg-slate-800`}>
                                            <div className="flex justify-end gap-1.5 relative z-20">
                                                <button onClick={() => handleEditClick(room)} className="cursor-pointer p-1.5 text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteClick(room)} className="cursor-pointer p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaginationInfo totalItems={processedRooms.length} />
        </div>
    );
}
