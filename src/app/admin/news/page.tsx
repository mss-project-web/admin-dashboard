"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, Link as LinkIcon, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, CheckSquare, Square, Download } from "lucide-react";
import { newsService } from "@/services/newsService";
import { News } from "@/types/news";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";

import NewsModal from "./components/NewsModal";
import DeleteNewsModal from "./components/DeleteNewsModal";

const MONTHS = [
    { value: "", label: "ทุกเดือน" },
    { value: "0", label: "มกราคม" }, { value: "1", label: "กุมภาพันธ์" }, { value: "2", label: "มีนาคม" },
    { value: "3", label: "เมษายน" }, { value: "4", label: "พฤษภาคม" }, { value: "5", label: "มิถุนายน" },
    { value: "6", label: "กรกฎาคม" }, { value: "7", label: "สิงหาคม" }, { value: "8", label: "กันยายน" },
    { value: "9", label: "ตุลาคม" }, { value: "10", label: "พฤศจิกายน" }, { value: "11", label: "ธันวาคม" }
];

export default function NewsPage() {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter State
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    // Selection State
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<News[]>([]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await newsService.getAll();
            // Sort by date descending
            const sorted = (data || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNewsList(sorted);
        } catch (err) {
            console.error("Failed to fetch news:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [refreshKey]);

    // Years for filter (Current year back 10 years)
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const y = [{ value: "", label: "ทุกปี" }];
        for (let i = 0; i < 7; i++) {
            y.push({ value: (currentYear - i).toString(), label: (currentYear - i + 543).toString() });
        }
        return y;
    }, []);

    const handleAddClick = () => {
        setSelectedNews(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (news: News) => {
        setSelectedNews(news);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (news: News) => {
        setNewsToDelete([news]);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDeleteClick = () => {
        const itemsToDelete = newsList.filter(n => selectedItems.has(n._id));
        setNewsToDelete(itemsToDelete);
        setIsDeleteModalOpen(true);
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredNews.length && filteredNews.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredNews.map(n => n._id)));
        }
    };

    const filteredNews = useMemo(() => {
        return newsList.filter(n => {
            const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesMonth = true;
            let matchesYear = true;

            if (selectedMonth || selectedYear) {
                const date = new Date(n.createdAt);
                if (selectedMonth) {
                    matchesMonth = date.getMonth().toString() === selectedMonth;
                }
                if (selectedYear) {
                    matchesYear = date.getFullYear().toString() === selectedYear;
                }
            }

            return matchesSearch && matchesMonth && matchesYear;
        });
    }, [newsList, searchTerm, selectedMonth, selectedYear]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedMonth, selectedYear]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const currentItems = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleExport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <html>
                <head>
                    <title>News Export</title>
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
                    <h1>\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23\u0e02\u0e48\u0e32\u0e27\u0e2a\u0e32\u0e23\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14 (${filteredNews.length} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23)</h1>
                    <span>\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 \u0e13 \u0e27\u0e31\u0e19\u0e17\u0e35\u0e48: ${new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
                    <br/><br/>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px;">\u0e25\u0e33\u0e14\u0e31\u0e1a</th>
                                <th>\u0e0a\u0e37\u0e48\u0e2d\u0e02\u0e48\u0e32\u0e27</th>
                                <th>\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14</th>
                                <th style="width: 120px;">\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48</th>
                                <th>\u0e25\u0e34\u0e07\u0e01\u0e4c</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredNews.map((news, index) => `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td>${news.name}</td>
                                    <td>${news.description || '-'}</td>
                                    <td class="text-center">${new Date(news.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                    <td>${news.link || '-'}</td>
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
        <div className="w-full space-y-6 pb-32">
            <NewsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsModalOpen(false); }}
                newsToEdit={selectedNews}
            />

            <DeleteNewsModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsDeleteModalOpen(false);
                    setSelectedItems(new Set()); // Clear selection after delete
                }}
                newsToDelete={newsToDelete}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        จัดการข่าวสาร
                    </h2>
                </div>
                <div className="flex gap-2">
                    {selectedItems.size > 0 && (
                        <button
                            onClick={handleBulkDeleteClick}
                            className="cursor-pointer flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all animate-in fade-in"
                        >
                            <Trash2 size={18} />
                            ลบที่เลือก ({selectedItems.size})
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        className="cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all text-slate-700"
                    >
                        <Download size={14} />
                        <span className="inline">Export</span>
                    </button>
                    <button
                        onClick={handleAddClick}
                        className="cursor-pointer flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all"
                    >
                        <Plus size={16} />
                        <span className="inline sm:hidden">เพิ่ม</span>
                        <span className="hidden sm:inline">เพิ่มข่าวสารใหม่</span>
                    </button>
                </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-white/20 shadow-sm rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-center gap-4">

                {/* Search & Filter Group */}
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาข่าวสาร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer min-w-[120px]"
                        >
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer min-w-[100px]"
                        >
                            {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>

                        {(searchTerm || selectedMonth || selectedYear) && (
                            <button
                                onClick={() => { setSearchTerm(""); setSelectedMonth(""); setSelectedYear(""); }}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span>แสดง:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sky-600 outline-none cursor-pointer"
                        >
                            {[10, 20, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronsLeft size={16} /></button>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                        <span className="mx-2 text-xs font-bold text-sky-600 whitespace-nowrap">หน้า {currentPage} / {totalPages || 1}</span>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"><ChevronsRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Selection Info Bar */}
            <div className="flex items-center gap-2 px-1">
                <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors"
                >
                    {selectedItems.size === filteredNews.length && filteredNews.length > 0 ? (
                        <CheckSquare size={18} className="text-sky-500" />
                    ) : (
                        <Square size={18} />
                    )}
                    เลือกทั้งหมด ({filteredNews.length})
                </button>
                {selectedItems.size > 0 && (
                    <span className="text-sm text-slate-400">
                        • เลือกอยู่ {selectedItems.size} รายการ
                    </span>
                )}
            </div>

            {/* News Grid */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Skeleton className="aspect-[4/3] w-full" />
                            <div className="p-3 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                                    <Skeleton className="h-4 w-10" />
                                    <div className="flex gap-1">
                                        <Skeleton className="h-6 w-6 rounded" />
                                        <Skeleton className="h-6 w-6 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <Calendar size={32} className="text-slate-300" />
                    </div>
                    <p className="font-medium text-lg">ไม่พบข่าวสาร</p>
                    <p className="text-sm">ลองปรับตัวกรอง หรือสร้างข่าวสารใหม่</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {currentItems.map((news) => {
                        const isSelected = selectedItems.has(news._id);
                        return (
                            <div
                                key={news._id}
                                className={`group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative ${isSelected ? 'border-sky-500 ring-1 ring-sky-500' : 'border-slate-200 dark:border-slate-800'}`}
                            >
                                {/* Checkbox Overlay */}
                                <div className={`absolute top-2 left-2 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(news._id); }}
                                        className="bg-white/90 backdrop-blur rounded text-sky-600 shadow-sm hover:scale-110 transition-transform p-0.5"
                                    >
                                        {isSelected ? <CheckSquare size={20} className="fill-sky-50" /> : <Square size={20} />}
                                    </button>
                                </div>

                                {/* Image Area */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    {news.images && news.images.length > 0 ? (
                                        <Image
                                            src={news.images[0]}
                                            alt={news.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300">
                                            <Calendar size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                        {formatDate(news.date)}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-3 flex flex-col flex-1 cursor-pointer" onClick={() => handleEditClick(news)}>
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2 text-sm group-hover:text-sky-600 transition-colors" title={news.name}>
                                        {news.name}
                                    </h3>

                                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3 flex-1">
                                        {news.description || "ไม่มีรายละเอียด"}
                                    </p>

                                    {/* Footer Actions */}
                                    <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                                        {news.link ? (
                                            <a
                                                href={news.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-0.5 bg-sky-50 px-1.5 py-0.5 rounded"
                                            >
                                                <LinkIcon size={10} />
                                                Link
                                            </a>
                                        ) : <span />}

                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(news); }}
                                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-all"
                                                title="แก้ไข"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(news); }}
                                                className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                                                title="ลบ"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records: {filteredNews.length}</span>
            </div>
        </div>
    );
}
