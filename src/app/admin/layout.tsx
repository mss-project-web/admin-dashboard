"use client";
import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import BottomNav from "@/app/components/BottomNav";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

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
                        <div className="h-9 w-9 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs uppercase" >
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
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