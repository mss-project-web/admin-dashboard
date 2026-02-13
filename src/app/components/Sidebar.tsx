"use client";
import {
    LayoutDashboard, Settings, FileText, Users,
    X, LogOut, ChevronLeft, ChevronRight, ChevronDown, User as UserIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { userService } from "@/services/userService";
import ProfileModal from "./ProfileModal";

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

    // Profile state
    const [profileName, setProfileName] = useState("");
    const [profileInitials, setProfileInitials] = useState("");
    const [profileRole, setProfileRole] = useState("");
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const me = await userService.getMe();
                const fn = me.firstName || "";
                const ln = me.lastName || "";
                setProfileName(`${fn} ${ln}`.trim());
                setProfileInitials(`${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase());
                setProfileRole(me.role);
            } catch (error) {
                console.error("Failed to load profile for sidebar", error);
                setProfileName("User");
                setProfileInitials("U");
            }
        };
        fetchProfile();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const roleLabel: Record<string, string> = {
        superadmin: "Super Admin",
        admin: "Admin",
        user: "User",
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

                {/* Profile Section */}
                <div className="flex-none p-3 border-t border-sky-50 dark:border-slate-800" ref={dropdownRef}>
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className={`cursor-pointer flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isCollapsed && !isOpen ? "justify-center" : ""}`}
                        >
                            {/* Avatar */}
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                                {profileInitials || "U"}
                            </div>
                            {(!isCollapsed || isOpen) && (
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-sm font-bold text-slate-700 dark:text-white truncate">{profileName || "Loading..."}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{roleLabel[profileRole] || profileRole}</div>
                                </div>
                            )}
                            {(!isCollapsed || isOpen) && (
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`} />
                            )}
                        </button>

                        {/* Dropdown */}
                        {showProfileDropdown && (
                            <div className={`absolute bottom-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 ${isCollapsed && !isOpen ? "left-0 w-48" : "left-0 right-0"}`}>
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        setShowProfileModal(true);
                                    }}
                                    className="cursor-pointer flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <UserIcon size={16} />
                                    <span className="font-medium">โปรไฟล์</span>
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-800" />
                                <button
                                    onClick={() => {
                                        setShowProfileDropdown(false);
                                        handleLogout();
                                    }}
                                    className="cursor-pointer flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                >
                                    <LogOut size={16} />
                                    <span className="font-bold">ออกจากระบบ</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </>
    );
}