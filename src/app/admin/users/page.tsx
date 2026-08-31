"use client";
import { useState, useMemo, useEffect } from "react";
import {
    Plus, Search, Edit2, Trash2,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ArrowUpDown, Mail, Phone
} from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import DeleteUserModal from "./components/DeleteUserModal";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Debounce search term to prevent rapid API calls
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to page 1 when search or limit changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, itemsPerPage]);

    // Server-side fetching
    const { users, total, totalPages, loading, error, refresh } = useUsers(currentPage, itemsPerPage, debouncedSearch);

    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const router = useRouter();
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

    const handleDeleteClick = (userToDelete: User) => {
        if (user && user._id === userToDelete._id) {
            alert("ไม่สามารถลบบัญชีผู้ใช้ที่กำลังใช้งานอยู่ได้");
            return;
        }
        setUserToDelete(userToDelete);
        setIsDeleteUserOpen(true);
    };



    // Unified loading state
    const isPageLoading = authLoading || loading;

    if (!authLoading && !isSuperAdmin) return <div className="p-8 text-center text-red-500 font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Superadmin Only)</div>;

    return (
        <div className="w-full space-y-4 pb-32">

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
                    <Link
                        href="/admin/users/create"
                        className="cursor-pointer flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        <span className="inline sm:hidden">เพิ่ม</span>
                        <span className="hidden sm:inline">เพิ่มผู้ใช้งานใหม่</span>
                    </Link>
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
                <div className="hidden overflow-x-auto custom-scrollbar pb-2 md:block">
                    <table className="w-full min-w-[1020px] table-fixed border-collapse text-left">
                        <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="px-4 py-3 w-16 text-center">#</th>
                                <th className="px-6 py-3 w-1/4">ผู้ใช้งาน <ArrowUpDown size={10} className="inline ml-1" /></th>
                                <th className="px-6 py-3">ติดต่อ</th>
                                <th className="px-6 py-3 w-48 text-center font-medium">สังกัดฝ่าย</th>
                                <th className="px-6 py-3 w-32 text-center font-medium">บทบาท</th>
                                <th className="px-6 py-3 w-40 text-center">เข้าใช้งานล่าสุด</th>
                                <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                            {error ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-red-500 bg-red-50/50">
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
                                        <td className="px-4 py-4 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
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
                                        <td className="px-6 py-4 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
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
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</td>
                                </tr>
                            ) : (
                                users.map((userItem, index) => (
                                    <tr
                                        key={userItem._id}
                                        className={`group border-y transition-colors ${user?._id === userItem._id
                                            ? 'border-y-2 border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20'
                                            : `${index % 2 === 0 ? 'border-transparent bg-white dark:bg-slate-950' : 'border-transparent bg-[#f8fafc] dark:bg-[#0f172a]'} hover:bg-sky-50/30`}`}
                                    >
                                        <td className="px-4 py-4 text-center font-medium text-slate-500">
                                            {((currentPage - 1) * itemsPerPage) + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs uppercase shadow-sm">
                                                    {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">{userItem.firstName} {userItem.lastName}</div>
                                                    <div className="text-[10px] text-slate-400">สร้างเมื่อ {formatDate(userItem.createdAt).split(' ').slice(0, 3).join(' ')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 space-y-0.5 font-medium">
                                            <div className="flex items-center gap-1.5"><Mail size={12} className="text-sky-400" /> {userItem.email}</div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Phone size={12} /> {userItem.phoneNumber || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {userItem.departments && userItem.departments.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 justify-center">
                                                    {userItem.departments.map(d => (
                                                        <span key={d} className="inline-flex px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50">
                                                            {d}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col gap-2 items-center">
                                                <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase border ${userItem.role === 'superadmin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    userItem.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {userItem.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-400 font-medium text-xs">
                                            {formatDate(userItem.lastLoginAt!) || "-"}
                                        </td>

                                        <td className={`px-6 py-4 text-right pr-6 sticky right-0 transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.02)] ${user?._id === userItem._id
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30'
                                            : `${index % 2 === 0 ? 'border-slate-100 bg-white dark:bg-slate-950' : 'border-slate-100 bg-slate-50 dark:bg-slate-900'} group-hover:bg-sky-50 dark:group-hover:bg-slate-800`}`}>
                                            <div className="flex justify-end gap-1.5 relative z-20">
                                                {user?._id === userItem._id ? (
                                                    <span className="inline-flex min-w-[104px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm shadow-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300 dark:shadow-none">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" aria-hidden="true" />
                                                        กำลังใช้งาน
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Link href={"/admin/users/edit/" + userItem._id} aria-label={"แก้ไขผู้ใช้ " + userItem.email} className="cursor-pointer rounded-lg border border-transparent p-1.5 text-sky-600 shadow-sm transition-colors hover:border-sky-100 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><Edit2 size={14} aria-hidden="true" /></Link>
                                                        <button type="button" onClick={() => handleDeleteClick(userItem)} aria-label={"ลบผู้ใช้ " + userItem.email} className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"><Trash2 size={14} aria-hidden="true" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-3 p-3 md:hidden">
                    {error ? (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
                            <p className="font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                            <p className="mt-1 text-xs">{error}</p>
                            <button type="button" onClick={refresh} className="mt-3 rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-900 dark:bg-slate-950">
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    ) : isPageLoading ? (
                        [...Array(5)].map((_, index) => (
                            <div key={index} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-11 w-11 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-44 max-w-full" />
                                    </div>
                                    <Skeleton className="h-7 w-16 rounded-lg" />
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28 justify-self-end" />
                                </div>
                            </div>
                        ))
                    ) : users.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400 dark:border-slate-800">
                            ไม่พบข้อมูลผู้ใช้งาน
                        </div>
                    ) : (
                        users.map((userItem, index) => {
                            const isCurrentUser = user?._id === userItem._id;
                            const displayName = [userItem.firstName, userItem.lastName].filter(Boolean).join(" ") || userItem.email;
                            const roleClass = userItem.role === "superadmin"
                                ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                                : userItem.role === "admin"
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300"
                                    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
                            return (
                                <article key={userItem._id} className={"rounded-2xl border-2 p-4 shadow-sm transition-shadow hover:shadow-md " + (isCurrentUser
                                    ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950")}>
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sm font-bold uppercase text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300">
                                            {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="truncate font-bold text-slate-800 dark:text-slate-100">{displayName}</h3>
                                                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{userItem.email}</p>
                                                </div>
                                                <span className="shrink-0 text-xs font-bold text-slate-400">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-xs dark:border-slate-800">
                                        <div className="min-w-0">
                                            <p className="text-slate-400">เบอร์โทร</p>
                                            <p className="mt-1 truncate font-semibold text-slate-700 dark:text-slate-200">{userItem.phoneNumber || "-"}</p>
                                        </div>
                                        <div className="min-w-0 text-right">
                                            <p className="text-slate-400">เข้าใช้งานล่าสุด</p>
                                            <p className="mt-1 truncate font-semibold text-slate-700 dark:text-slate-200">{formatDate(userItem.lastLoginAt!) || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className={"inline-flex rounded-lg border px-2 py-1 text-[10px] font-black uppercase " + roleClass}>{userItem.role}</span>
                                            {userItem.departments?.slice(0, 2).map((department) => (
                                                <span key={department} className="inline-flex max-w-[140px] truncate rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                                                    {department}
                                                </span>
                                            ))}
                                            {(userItem.departments?.length ?? 0) > 2 && <span className="px-1 py-1 text-[10px] font-bold text-slate-400">+{userItem.departments!.length - 2}</span>}
                                        </div>
                                        {isCurrentUser ? (
                                            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm shadow-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300 dark:shadow-none">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                                                กำลังใช้งาน
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <Link href={"/admin/users/edit/" + userItem._id} aria-label={"แก้ไขผู้ใช้ " + userItem.email} className="rounded-lg border border-sky-100 p-2 text-sky-600 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-sky-900/60 dark:hover:bg-sky-950/40">
                                                    <Edit2 size={15} aria-hidden="true" />
                                                </Link>
                                                <button type="button" onClick={() => handleDeleteClick(userItem)} aria-label={"ลบผู้ใช้ " + userItem.email} className="rounded-lg border border-rose-100 p-2 text-rose-500 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-900/60 dark:hover:bg-rose-950/30">
                                                    <Trash2 size={15} aria-hidden="true" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 4. Bottom Statistics Info */}
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                <span>Total Records Found: {total}</span>
            </div>
        </div>
    );
}
