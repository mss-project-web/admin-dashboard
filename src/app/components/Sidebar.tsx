"use client";
import {
    LayoutDashboard, Settings, FileText, Users,
    X, LogOut, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

const menuItems = [
    { icon: LayoutDashboard, label: "ภาพรวม", href: "/admin" },
    {
        icon: FileText, label: "จัดการบทความ", href: "/admin/blog",
        subItems: [
            { label: "เนื้อหาบทความ", href: "/admin/blog/content" },
        ]
    },
    {
        icon: Settings, label: "ตั้งค่าเว็บหลัก", href: "/admin",
        subItems: [
            { label: "จัดการกิจกรรม", href: "/admin/activity" },
            { label: "จัดการห้องละหมาด", href: "/admin/prayer-rooms" },
            { label: "จัดการข่าวสาร", href: "/admin/news" },
        ]
    },
    { icon: Users, label: "จัดการผู้ใช้", href: "/admin/users", roles: ['superadmin'] },
    { icon: FileText, label: "System Logs", href: "/admin/log", roles: ['superadmin'] },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isSuperAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleSubmenu = (label: string) => {
        if (isCollapsed && !isOpen) return;
        setOpenMenus(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);
    };

    const visibleMenuItems = menuItems.filter(item => !item.roles || (item.roles.includes('superadmin') && isSuperAdmin));

    const handleLogout = async () => {
        try {
            await authApi.logout();
            router.push("/auth/login?logout=success");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <>
            <div className={`fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsOpen(false)} />

            <aside className={`fixed inset-y-0 left-0 z-[120] transition-all duration-300 bg-white dark:bg-slate-950 border-r border-sky-100 dark:border-slate-800 flex flex-col h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static 
          ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-[280px]`}>

                <div className={`flex-none flex items-center h-16 px-4 border-b border-sky-50 dark:border-slate-800 ${isCollapsed && !isOpen ? "lg:justify-center" : "justify-between"}`}>
                    {(!isCollapsed || isOpen) && (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold">S</div>
                            <span className="text-xl font-bold text-sky-600">MSS - Admin</span>
                        </div>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:block p-1.5 hover:bg-sky-50 rounded-md text-sky-600">
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                    {visibleMenuItems.map((item) => {
                        const hasSub = item.subItems && item.subItems.length > 0;
                        const isSubOpen = openMenus.includes(item.label);
                        const active = pathname.startsWith(item.href);

                        return (
                            <div key={item.label}>
                                {hasSub ? (
                                    <button onClick={() => toggleSubmenu(item.label)} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50"}`}>
                                        <item.icon size={20} />
                                        {(!isCollapsed || isOpen) && <span className="flex-1 text-left font-medium">{item.label}</span>}
                                        {(!isCollapsed || isOpen) && <ChevronDown size={14} className={isSubOpen ? "rotate-180" : ""} />}
                                    </button>
                                ) : (
                                    <Link href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-500 hover:bg-slate-50"}`}>
                                        <item.icon size={20} />
                                        {(!isCollapsed || isOpen) && <span className="font-medium">{item.label}</span>}
                                    </Link>
                                )}
                                {hasSub && isSubOpen && (!isCollapsed || isOpen) && (
                                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-sky-100 pl-4">
                                        {item.subItems?.map(sub => (
                                            <Link key={sub.href} href={sub.href} className={`block py-2 text-sm ${pathname === sub.href ? "text-sky-600 font-bold" : "text-slate-500 hover:text-sky-500"}`}>{sub.label}</Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="flex-none p-4 border-t border-sky-50 dark:border-slate-800">
                    <button className={`cursor-pointer flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 font-bold transition-all ${isCollapsed && !isOpen ? "justify-center" : ""}`} onClick={handleLogout}>
                        <LogOut size={20} />
                        {(!isCollapsed || isOpen) && <span>ออกจากระบบ</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}