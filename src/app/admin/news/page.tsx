"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Calendar, Link as LinkIcon, Loader2, Filter, X, CheckSquare, Square } from "lucide-react";
import { newsService } from "@/services/newsService";
import { News } from "@/types/news";
import Image from "next/image";

import NewsModal from "./components/NewsModal";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { Pagination, PaginationInfo } from "@/app/components/ui/Pagination";
import { GridSkeleton } from "@/app/components/ui/GridSkeleton";
import { FilterBar, FilterSelect } from "@/app/components/ui/FilterBar";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/button";

const MONTHS = [
    { value: "", label: "ทุกเดือน" },
    { value: "01", label: "มกราคม" },
    { value: "02", label: "กุมภาพันธ์" },
    { value: "03", label: "มีนาคม" },
    { value: "04", label: "เมษายน" },
    { value: "05", label: "พฤษภาคม" },
    { value: "06", label: "มิถุนายน" },
    { value: "07", label: "กรกฎาคม" },
    { value: "08", label: "สิงหาคม" },
    { value: "09", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" }
];

export default function NewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNewsItem, setSelectedNewsItem] = useState<News | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Multi-select state
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => {
            const y = currentYear - i;
            return { value: y.toString(), label: (y + 543).toString() };
        });
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await newsService.getAll();
            setNews(data);
        } catch (err) {
            console.error("Failed to fetch news:", err);
            setError("Failed to load news");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [refreshKey]);

    const handleAddClick = () => {
        setSelectedNewsItem(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (item: News) => {
        setSelectedNewsItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: News) => {
        setNewsToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;
        setIsDeleting(true);
        try {
            await newsService.delete(newsToDelete._id);
            setRefreshKey(prev => prev + 1);
            setIsDeleteModalOpen(false);
            setNewsToDelete(null);
        } catch (error) {
            console.error(error);
            setError("Failed to delete news");
        } finally {
            setIsDeleting(false);
        }
    };

    // Toggle selection of a single item
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    // Select/Deselect all visible items
    const toggleSelectAll = () => {
        if (selectedItems.size === filteredNews.length && filteredNews.length > 0) {
            setSelectedItems(new Set());
        } else {
            const newSelected = new Set(filteredNews.map(item => item._id));
            setSelectedItems(newSelected);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedItems.size === 0) return;
        setIsBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        setIsBulkDeleting(true);
        try {
            const idsToDelete = Array.from(selectedItems);
            await Promise.all(idsToDelete.map(id => newsService.delete(id)));
            setRefreshKey(prev => prev + 1);
            setSelectedItems(new Set());
            setIsBulkDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to bulk delete:", error);
            setError("Failed to delete some items");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const filteredNews = useMemo(() => {
        return news.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by Month
            let matchesMonth = true;
            if (selectedMonth) {
                const itemDate = new Date(item.date || item.createdAt || Date.now());
                const itemMonth = (itemDate.getMonth() + 1).toString().padStart(2, '0');
                matchesMonth = itemMonth === selectedMonth;
            }

            // Filter by Year
            let matchesYear = true;
            if (selectedYear) {
                const itemDate = new Date(item.date || item.createdAt || Date.now());
                const itemYear = itemDate.getFullYear().toString();
                matchesYear = itemYear === selectedYear;
            }

            return matchesSearch && matchesMonth && matchesYear;
        });
    }, [news, searchTerm, selectedMonth, selectedYear]);

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const currentItems = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full space-y-6 pb-32">
            <NewsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { setRefreshKey(prev => prev + 1); setIsModalOpen(false); }}
                newsToEdit={selectedNewsItem}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="ยืนยันการลบข่าวสาร"
                description="คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้"
                itemName={newsToDelete?.name || ""}
                isDeleting={isDeleting}
            />

            <DeleteModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title="ยืนยันการลบหมู่"
                description={`คุณแน่ใจหรือไม่ที่จะลบข่าวสารจำนวน ${selectedItems.size} รายการ?`}
                itemName={`ข่าวสาร ${selectedItems.size} รายการ`}
                isDeleting={isBulkDeleting}
            />

            {/* Headers */}
            <PageHeader
                title="จัดการข่าวสาร"
                colorClass="bg-sky-500"
                action={{
                    label: "เพิ่มข่าวใหม่",
                    onClick: handleAddClick
                }}
            >
                {selectedItems.size > 0 && (
                    <Button
                        onClick={handleBulkDeleteClick}
                        className="cursor-pointer flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all animate-in fade-in active:scale-95"
                    >
                        <Trash2 size={16} />
                        ลบที่เลือก ({selectedItems.size})
                    </Button>
                )}
            </PageHeader>

            {/* Controls */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="ค้นหา ชื่อข่าว, รายละเอียด..."
                        className="w-full xl:w-auto mb-0"
                    >
                        <FilterSelect
                            icon={<Calendar size={14} className="text-slate-400 flex-shrink-0" />}
                            value={selectedMonth}
                            onChange={(val) => { setSelectedMonth(val); setCurrentPage(1); }}
                            options={MONTHS}
                            defaultLabel="ทุกเดือน"
                            className="min-w-[120px]"
                        />
                        <FilterSelect
                            icon={<Calendar size={14} className="text-slate-400 flex-shrink-0" />}
                            value={selectedYear}
                            onChange={(val) => { setSelectedYear(val); setCurrentPage(1); }}
                            options={years}
                            defaultLabel="ทุกปี"
                            className="min-w-[100px]"
                        />
                        {(selectedMonth || selectedYear) && (
                            <Button
                                onClick={() => { setSelectedMonth(""); setSelectedYear(""); }}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                title="ล้างตัวกรอง"
                            >
                                <X size={16} />
                            </Button>
                        )}
                    </FilterBar>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredNews.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* Selection Info Bar */}
            {filteredNews.length > 0 && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        {selectedItems.size === filteredNews.length && filteredNews.length > 0 ? (
                            <CheckSquare size={18} className="text-sky-500" />
                        ) : (
                            <Square size={18} />
                        )}
                        {selectedItems.size === filteredNews.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
                    </Button>
                    {selectedItems.size > 0 && (
                        <span className="text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded-full">
                            เลือกอยู่ {selectedItems.size} รายการ
                        </span>
                    )}
                </div>
            )}

            {/* News Grid */}
            {
                loading ? (
                    <GridSkeleton count={6} />
                ) : filteredNews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <Search size={32} className="text-slate-300" />
                        </div>
                        <p>ไม่พบข่าวสารที่ค้นหา</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {currentItems.map((item) => {
                            const isSelected = selectedItems.has(item._id);
                            return (
                                <div
                                    key={item._id}
                                    className={`group h-full relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg flex flex-col ${isSelected
                                        ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                                        : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-200 dark:hover:border-sky-800'
                                        }`}
                                >
                                    {/* Selection Checkbox Overlay */}
                                    <div className="absolute top-2 left-2 z-20">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(item._id);
                                            }}
                                            className={`p-1 rounded-md transition-all ${isSelected
                                                ? 'bg-sky-500 text-white shadow-sm'
                                                : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:bg-white hover:text-sky-500 shadow-sm opacity-0 group-hover:opacity-100'
                                                }`}
                                        >
                                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </Button>
                                    </div>



                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <Calendar size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-2 left-3 right-3 text-white text-[10px] sm:text-xs font-medium truncate flex items-center gap-1">
                                            <Calendar size={10} className="text-sky-300" />
                                            {item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-grow">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2 text-sm group-hover:text-sky-600 transition-colors h-10">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 h-8">
                                            {item.description}
                                        </p>

                                        {/* Card Actions Footer */}
                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                            <Button
                                                onClick={() => handleEditClick(item)}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/40 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={12} />
                                                แก้ไข
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteClick(item)}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={12} />
                                                ลบ
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            <PaginationInfo totalItems={filteredNews.length} />
        </div>
    );
}
