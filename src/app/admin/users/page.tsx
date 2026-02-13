"use client";
import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, Mail, Phone, Download
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import UserModal from "./components/UserModal";
import DeleteUserModal from "./components/DeleteUserModal";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";

export default function UsersPage() {
    const { users, loading, error, refresh } = useUsers();
    const router = useRouter();


    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' | null }>({ key: 'createdAt' as keyof User, direction: 'desc' });

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const { user, isSuperAdmin, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/admin');
        }
    }, [isSuperAdmin, authLoading, router]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleAddClick = () => {
        setSelectedUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteClick = (userToDelete: User) => {
        if (user && user._id === userToDelete._id) {
            alert("ไม่สามารถลบบัญชีผู้ใช้ที่กำลังใช้งานอยู่ได้");
            return;
        }
        setUserToDelete(userToDelete);
        setIsDeleteUserOpen(true);
    };

    const processedUsers = useMemo(() => {
        let items = [...users].filter(u =>
            u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phoneNumber?.includes(searchTerm)
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
    }, [users, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const currentItems = processedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
        setSortConfig({ key, direction });
    };

    // Unified loading state
    const isPageLoading = authLoading || loading;

    if (!authLoading && !isSuperAdmin) return <div className="p-8 text-center text-red-500 font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Superadmin Only)</div>;

    return (
        <div className="w-full space-y-4 pb-32">

            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSuccess={refresh}
                userToEdit={selectedUser}
            />

            {userToDelete && (
                <DeleteUserModal
                    isOpen={isDeleteUserOpen}
                    onClose={() => setIsDeleteUserOpen(false)}
                    onSuccess={refresh}
                    userIdToDelete={userToDelete._id}
                    userNameToDelete={`${userToDelete.firstName} ${userToDelete.lastName}`}
                />
            )}

            {/* 1. Top Header Section */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        การจัดการผู้ใช้
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button className="cursor-pointer flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all">
                        <Download size={14} />
                        <span className="inline sm:hidden">Export</span>
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    <button
                        onClick={handleAddClick}
                        className="cursor-pointer flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="inline sm:hidden">เพิ่ม</span>
                        <span className="hidden sm:inline">เพิ่มผู้ใช้งานใหม่</span>
                    </button>
                </div>
            </div>

            {/* 2. STICKY TOOLBAR */}
            <div className="top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm mb-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="ค้นหา ชื่อ, อีเมล, เบอร์โทร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

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

            {/* 3. TABLE AREA */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th onClick={() => requestSort('firstName')} className="px-6 py-3 w-1/4 cursor-pointer hover:bg-sky-50 transition-colors text-sky-600">ผู้ใช้งาน <ArrowUpDown size={10} className="inline ml-1" /></th>
                                <th className="px-6 py-3">ติดต่อ</th>
                                <th onClick={() => requestSort('role')} className="px-6 py-3 w-32 text-center font-medium cursor-pointer hover:bg-sky-50">บทบาท</th>
                                <th onClick={() => requestSort('lastLoginAt')} className="px-6 py-3 w-40 text-center cursor-pointer hover:bg-sky-50">เข้าใช้งานล่าสุด</th>
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {error ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-red-500 bg-red-50/50">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล</span>
                                            <span className="text-xs text-red-400">{error}</span>
                                            <button
                                                onClick={refresh}
                                                className="mt-2 px-4 py-1.5 bg-white border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors shadow-sm text-xs font-bold"
                                            >
                                                ลองใหม่อีกครั้ง
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : isPageLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-9 w-9 rounded-full" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-20 mx-auto rounded" /></td>
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-4 w-28 mx-auto" /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</td>
                                </tr>
                            ) : (
                                currentItems.map((user, index) => (
                                    <tr
                                        key={user._id}
                                        className={`group transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'
                                            } hover:bg-sky-50/30`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs uppercase shadow-sm">
                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">{user.firstName} {user.lastName}</div>
                                                    <div className="text-[10px] text-slate-400">Created: {formatDate(user.createdAt).split(' ')[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 space-y-0.5 font-medium">
                                            <div className="flex items-center gap-1.5"><Mail size={12} className="text-sky-400" /> {user.email}</div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Phone size={12} /> {user.phoneNumber || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase border ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-400 font-medium text-xs">
                                            {formatDate(user.lastLoginAt!) || "-"}
                                        </td>

                                        <td className={`px-6 py-4 text-right pr-8 sticky right-0 border-l border-slate-100 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'
                                            } group-hover:bg-sky-50 dark:group-hover:bg-slate-800`}>
                                            <div className="flex justify-end gap-1.5 relative z-20">
                                                <button onClick={() => handleEditClick(user)} className="cursor-pointer p-1.5 text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteClick(user)} className="cursor-pointer p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Bottom Statistics Info */}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records Found: {processedUsers.length}</span>
            </div>
        </div>
    );
}