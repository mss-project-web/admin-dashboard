"use client";

import { BlogPost } from "@/types/blog";
import { Users, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";

interface BlogTableProps {
    blogs: BlogPost[];
    isLoading: boolean;
    onDelete: (id: string) => void;
}

export default function BlogTable({ blogs, isLoading, onDelete }: BlogTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                        <thead>
                            <tr>
                                {[...Array(6)].map((_, i) => <th key={i} className="px-6 py-4"><Skeleton className="h-4 w-20" /></th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-6 py-4"><Skeleton className="h-10 w-16 rounded-md" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                    <td className="px-6 py-4"><div className="flex justify-end gap-2"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">ไม่พบข้อมูลบทความ</h3>
                <p className="text-slate-500 text-sm">ลองค้นหาด้วยคำสำคัญอื่น หรือสร้างบทความใหม่</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar pb-2">
                <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                    <thead className="z-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        <tr>
                            <th className="px-6 py-3 w-[100px] text-center">รูปปก</th>
                            <th className="px-6 py-3 w-[25%] text-sky-600 cursor-pointer hover:bg-sky-50 transition-colors">
                                หัวข้อบทความ <ArrowUpDown size={10} className="inline ml-1" />
                            </th>
                            <th className="px-6 py-3 w-[15%]">หมวดหมู่</th>
                            <th className="px-6 py-3 w-[10%] text-center">เข้าชม</th>
                            <th className="px-6 py-3 w-[15%]">วันที่สร้าง</th>
                            <th className="px-6 py-3 w-28 text-right pr-8 sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] divide-y divide-slate-100 dark:divide-slate-800">
                        {blogs.map((blog, index) => (
                            <tr
                                key={blog._id}
                                className={`group transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-[#f8fafc] dark:bg-[#0f172a]'} hover:bg-sky-50`}
                            >
                                <td className="px-6 py-4">
                                    <div className="h-10 w-16 relative rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                        {blog.coverImage ? (
                                            <Image
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <Users size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1" title={blog.title}>
                                        {blog.title}
                                    </div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">{blog.description || "-"}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                                        {typeof blog.group === 'string' ? blog.group : blog.group?.name || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-mono">
                                    {blog.views || 0}
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
                                        <Link
                                            href={`/admin/blog/content/edit/${blog.slug}`}
                                            className="cursor-pointer p-1.5 text-sky-600 hover:bg-white rounded shadow-sm border border-transparent hover:border-sky-100 transition-all"
                                            title="แก้ไข"
                                        >
                                            <Pencil size={14} />
                                        </Link>
                                        <Button
                                            onClick={() => onDelete(blog._id)}
                                            className="cursor-pointer p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"
                                            title="ลบ"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-center items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Total Items: {blogs.length}</span>
            </div>
        </div>
    );
}
