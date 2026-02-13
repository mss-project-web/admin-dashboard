"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, MapPin, Loader2, Download, Building
} from "lucide-react";
import { prayerRoomService } from "@/services/prayerRoomService";
import { PrayerRoom } from "@/types/prayer-room";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";

import PrayerRoomModal from "./components/PrayerRoomModal";
import DeletePrayerRoomModal from "./components/DeletePrayerRoomModal";

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

    const processedRooms = useMemo(() => {
        let items = [...prayerRooms].filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.detail.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.direction !== null) {
            items.sort((a, b) => {
                const aValue = a[sortConfig.key] || "";
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

    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <html>
                <head>
                    <title>Prayer Room Export</title>
                    <style>
                        body { font-family: 'Sarabun', sans-serif; color: black; background: white; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
                        th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
                        th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
                        h1 { text-align: center; margin-bottom: 20px; font-size: 18px; }
                        .text-center { text-align: center; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <h1>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e2b\u0e49\u0e2d\u0e07\u0e25\u0e30\u0e2b\u0e21\u0e32\u0e14\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14 (${processedRooms.length} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23)</h1>
                    <span>\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 \u0e13 \u0e27\u0e31\u0e19\u0e17\u0e35\u0e48: ${new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
                    <br/><br/>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px;">\u0e25\u0e33\u0e14\u0e31\u0e1a</th>
                                <th>\u0e0a\u0e37\u0e48\u0e2d\u0e2b\u0e49\u0e2d\u0e07\u0e25\u0e30\u0e2b\u0e21\u0e32\u0e14</th>
                                <th>\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48\u0e15\u0e31\u0e49\u0e07</th>
                                <th>\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14</th>
                                <th>\u0e2a\u0e34\u0e48\u0e07\u0e2d\u0e33\u0e19\u0e27\u0e22\u0e04\u0e27\u0e32\u0e21\u0e2a\u0e30\u0e14\u0e27\u0e01</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${processedRooms.map((room, index) => `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>${room.name}${room.faculty ? ' (' + room.faculty + ')' : ''}</td>
                                    <td>${room.place || '-'}</td>
                                    <td>${room.detail || '-'}</td>
                                    <td>${room.facilities?.join(', ') || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="w-full space-y-4 pb-32">
            <PrayerRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsModalOpen(false); }}
                prayerRoomToEdit={selectedPrayerRoom}
            />

            <DeletePrayerRoomModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsDeleteModalOpen(false); }}
                prayerRoomToDelete={prayerRoomToDelete}
            />

            {/* Headers */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        จัดการห้องละหมาด
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all text-slate-700"
                    >
                        <Download size={14} />
                        <span className="inline">Export</span>
                    </button>
                    <button
                        onClick={handleAddClick}
                        className="cursor-pointer flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="inline sm:hidden">เพิ่ม</span>
                        <span className="hidden sm:inline">เพิ่มห้องละหมาด</span>
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
                            placeholder="ค้นหา ชื่อ, สถานที่, รายละเอียด..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span>แสดง:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-emerald-600 outline-none"
                            >
                                {[10, 20, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronsLeft size={16} /></button>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <span className="mx-2 text-xs font-bold text-emerald-600">หน้า {currentPage} / {totalPages || 1}</span>
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
                                <th onClick={() => requestSort('name')} className="px-6 py-3 w-1/5 cursor-pointer hover:bg-emerald-50 transition-colors text-emerald-600">ชื่อห้องละหมาด <ArrowUpDown size={10} className="inline ml-1" /></th>
                                <th onClick={() => requestSort('place')} className="px-6 py-3 w-[20%] cursor-pointer hover:bg-emerald-50 transition-colors">สถานที่ตั้ง</th>
                                <th className="px-6 py-3 w-[25%]">รายละเอียด</th>
                                <th className="px-6 py-3 w-[15%]">สิ่งอำนวยความสะดวก</th>
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
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                                        <td className="px-6 py-4"><div className="flex gap-1"><Skeleton className="h-5 w-12" /><Skeleton className="h-5 w-12" /></div></td>
                                        <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
                                    </tr>
                                ))
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

            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records: {processedRooms.length}</span>
            </div>
        </div>
    );
}
