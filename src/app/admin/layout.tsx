"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import BottomNav from "@/app/components/BottomNav";
import { Menu, Bell, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { user } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleLogout = async () => {
        try {
            await authApi.logout();
            router.push("/auth/login?logout=success");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 relative">

                <header className="flex-none h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-sky-50 rounded-lg text-slate-500"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="font-bold text-lg md:text-xl tracking-tight">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{user?.email}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user?.role}</div>
                        </div>

                        {/* Clickable Avatar with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="cursor-pointer h-9 w-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs uppercase hover:ring-2 hover:ring-sky-300 transition-all"
                            >
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </button>

                            {showProfileDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                                    <button
                                        onClick={() => {
                                            setShowProfileDropdown(false);
                                            router.push("/admin/profile");
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
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
                    {children}
                </main>
            </div>

            <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
    );
}