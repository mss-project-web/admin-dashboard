"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ArrowUpDown, FileText, Calendar, Eye, Loader2, Filter,
    CheckSquare, Square
} from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogPost, BlogGroup } from "@/types/blog";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import DeleteModal from "@/app/components/ui/DeleteModal";
import { Pagination, PaginationInfo } from "@/app/components/ui/Pagination";
import { TableSkeleton } from "@/app/components/ui/TableSkeleton";
import { SortableHeader, TableHeader } from "@/app/components/ui/SortableHeader";
import { FilterBar, FilterSelect } from "@/app/components/ui/FilterBar";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Button } from "@/app/components/ui/button";
import { X } from "lucide-react";

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
  { value: "12", label: "ธันวาคม" },
];

export default function BlogContentPage() {
    const { toast } = useToast();
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [groups, setGroups] = useState<BlogGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof BlogPost; direction: 'asc' | 'desc' | null }>({ key: 'title', direction: 'asc' });
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => {
            const y = currentYear - i;
            return { value: y.toString(), label: (y + 543).toString() };
        });
    }, []);

    const [totalItems, setTotalItems] = useState(0);
    const [totalPagesServer, setTotalPagesServer] = useState(1);
    
    // Add debounced search to avoid spamming API
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await blogService.getAll(currentPage, itemsPerPage, {
                search: debouncedSearch,
                group: selectedGroup,
                status: selectedStatus,
                month: selectedMonth,
                year: selectedYear,
                sortKey: sortConfig.key,
                sortDir: sortConfig.direction
            });
            setBlogs(response?.data || []);
            setTotalItems(response?.total || 0);
            setTotalPagesServer(response?.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const groupsData = await blogService.getGroups();
            setGroups(groupsData || []);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [refreshKey, currentPage, itemsPerPage, debouncedSearch, selectedGroup, selectedStatus, selectedMonth, selectedYear, sortConfig]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Multi-select state
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const handleDeleteClick = (blog: BlogPost) => {
        setBlogToDelete({ id: blog._id, title: blog.title });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!blogToDelete) return;
        setIsDeleting(true);
        try {
            await blogService.delete(blogToDelete.id);
            toast({ title: "สำเร็จ", description: "ลบบทความเรียบร้อยแล้ว", variant: "default" });
            setRefreshKey(prev => prev + 1);
            setDeleteModalOpen(false);
            setBlogToDelete(null);
        } catch (error) {
            console.error(error);
            toast({ title: "ผิดพลาด", description: "ไม่สามารถลบบทความได้", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    // Toggle selection of a single item
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedItems(newSelected);
    };

    // Select/Deselect all visible items
    const toggleSelectAll = () => {
        if (selectedItems.size === currentItems.length && currentItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            const newSelected = new Set(currentItems.map((item) => item._id));
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
            await Promise.all(idsToDelete.map((id) => blogService.delete(id)));
            toast({ title: "สำเร็จ", description: `ลบบทความ ${idsToDelete.length} รายการเรียบร้อยแล้ว`, variant: "default" });
            setRefreshKey((prev) => prev + 1);
            setSelectedItems(new Set());
            setIsBulkDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to bulk delete:", error);
            toast({ title: "ผิดพลาด", description: "ไม่สามารถลบบทความบางรายการได้", variant: "destructive" });
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const currentItems = blogs;
    const totalPages = totalPagesServer;

    const requestSort = (key: keyof BlogPost) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
        setSortConfig({ key, direction });
    };

    return (
        <div className="w-full space-y-4 pb-32">
            {/* Headers */}
            <PageHeader
                title="จัดการบทความ"
                colorClass="bg-sky-500"
                action={{
                    label: "สร้างบทความใหม่",
                    href: "/admin/blog/content/create"
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
            <div className="bg-white dark:bg-slate-950 p-4 rounded-t-xl border-x border-t border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="ค้นหา ชื่อบทความ, คำอธิบาย..."
                        className="w-full xl:w-auto mb-0"
                    >
                        <FilterSelect
                            icon={<Filter size={14} className="text-slate-400 flex-shrink-0" />}
                            value={selectedGroup}
                            onChange={(val) => { setSelectedGroup(val); setCurrentPage(1); }}
                            options={groups.map(g => ({ value: g._id || g.id || g.name, label: g.name }))}
                            defaultLabel="ทุกหมวดหมู่"
                            className="min-w-[150px]"
                        />
                        <FilterSelect
                            icon={<Filter size={14} className="text-slate-400 flex-shrink-0" />}
                            value={selectedStatus}
                            onChange={(val) => { setSelectedStatus(val); setCurrentPage(1); }}
                            options={[
                                { value: "published", label: "Published" },
                                { value: "draft", label: "Draft" }
                            ]}
                            defaultLabel="ทุกสถานะ"
                            className="min-w-[120px]"
                        />
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
                        {(selectedMonth || selectedYear || selectedStatus || selectedGroup) && (
                            <Button
                                onClick={() => {
                                    setSelectedMonth("");
                                    setSelectedYear("");
                                    setSelectedStatus("");
                                    setSelectedGroup("");
                                }}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 transition-colors shrink-0"
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
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Selection Info Bar */}
            {totalItems > 0 && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                        {selectedItems.size === currentItems.length && currentItems.length > 0 ? (
                            <CheckSquare size={18} className="text-sky-500" />
                        ) : (
                            <Square size={18} />
                        )}
                        {selectedItems.size === currentItems.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกหน้านี้ทั้งหมด"}
                    </Button>
                    {selectedItems.size > 0 && (
                        <span className="text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded-full">
                            เลือกอยู่ {selectedItems.size} รายการ
                        </span>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-950 border-x border-b border-t border-slate-200 dark:border-slate-800 rounded-b-xl rounded-t-xl shadow-sm overflow-hidden mt-0">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="w-12 px-4 py-3 text-center">
                                    {/* Empty header for checkbox col */}
                                </th>
                                <TableHeader label="รูปปก" className="w-20 text-center" />
                                <SortableHeader label="หัวข้อบทความ" sortKey="title" currentSort={sortConfig} onSort={requestSort} className="w-1/4" />
                                <TableHeader label="คำอธิบาย" className="w-[20%]" />
                                <TableHeader label="หมวดหมู่" className="w-[15%]" />
                                <TableHeader label="สถานะ" className="w-24 text-center" />
                                <SortableHeader label="เข้าชม" sortKey="views" currentSort={sortConfig} onSort={requestSort} className="w-24 text-center" />
                                <SortableHeader label="วันที่สร้าง" sortKey="createdAt" currentSort={sortConfig} onSort={requestSort} className="w-[15%]" />
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <TableSkeleton columns={9} />
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-red-500">{error}</td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-400">ไม่พบบทความ</td>
                                </tr>
                            ) : (
                                currentItems.map((blog, index) => {
                                    const isSelected = selectedItems.has(blog._id);
                                    return (
                                    <tr
                                        key={blog._id}
                                        className={`group transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'} hover:bg-sky-50 ${isSelected ? "bg-sky-50 dark:bg-sky-900/10" : ""}`}
                                    >
                                        <td className="px-4 py-4 text-center border-r border-slate-100 dark:border-slate-800">
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); toggleSelection(blog._id); }}
                                                className={`p-1 rounded-md transition-all ${isSelected ? "text-sky-500" : "text-slate-400 hover:text-sky-500"}`}
                                            >
                                                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </Button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-10 w-16 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                                {blog.coverImage ? (
                                                    <Image
                                                        src={blog.coverImage}
                                                        alt={blog.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300"><FileText size={16} /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{blog.title}</div>
                                                <div className="text-[10px] text-slate-400 line-clamp-1">{blog.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <span className="line-clamp-2">{blog.description || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                                {typeof blog.group === 'string' ? blog.group : blog.group?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${blog.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {blog.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-mono">
                                            {blog.views}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {blog.createdAt ? format(new Date(blog.createdAt), 'dd MMM yy', { locale: th }) : '-'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {blog.createdAt ? format(new Date(blog.createdAt), 'HH:mm น.') : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right pr-8 sticky right-0 z-10 border-l border-slate-100 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'} group-hover:bg-sky-50 dark:group-hover:bg-slate-800`}>
                                            <div className="flex justify-end gap-1.5 relative z-20">
                                                <Link href={`/admin/blog/content/edit/${blog.slug}`} className="cursor-pointer p-1.5 text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all"><Edit2 size={14} /></Link>
                                                <button onClick={() => handleDeleteClick(blog)} className="cursor-pointer p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaginationInfo totalItems={totalItems} />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="ยืนยันการลบบทความ"
                description="คุณแน่ใจหรือไม่ที่จะลบบทความ"
                itemName={blogToDelete?.title || ""}
                isDeleting={isDeleting}
            />

            <DeleteModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={confirmBulkDelete}
                title="ยืนยันการลบหมู่"
                description={`คุณแน่ใจหรือไม่ที่จะลบบทความจำนวน ${selectedItems.size} รายการ?`}
                itemName={`บทความ ${selectedItems.size} รายการ`}
                isDeleting={isBulkDeleting}
            />
        </div>
    );
}
