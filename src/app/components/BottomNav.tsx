"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShieldCheck,
    Menu,
    UserCircle,
    FileText,
    Home,
    Logs
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { NavItem } from "@/types/navItem";

export default function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    const { isSuperAdmin } = useAuth();

    const leftNavItems: NavItem[] = isSuperAdmin
        ? [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/users", label: "Admins", icon: ShieldCheck },
        ]
        : [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/blog", label: "Blog", icon: FileText },
        ];

    const centerFloatingItem: NavItem = { href: "/", label: "Home", icon: Home, isFloating: true };

    const rightNavItems: NavItem[] =
        isSuperAdmin
            ? [
                { href: "/admin/log", label: "Logs", icon: Logs },
            ]
            : [
                { href: "/admin/profile", label: "Profile", icon: UserCircle },
            ];

    const visibleNavItems = [...leftNavItems, centerFloatingItem, ...rightNavItems];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
            <div className="relative mx-4 mb-4 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-2 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20">

                {visibleNavItems.map((item, index) => {
                    const isActive = pathname === item.href;

                    if (item.isFloating) {
                        return (
                            <div key={index} className="relative -mt-12">
                                <Link href={item.href}>
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-sky-400 to-blue-500 text-white shadow-[0_8px_20px_rgba(14,165,233,0.2)] border-4 border-white dark:border-slate-900 transition-transform active:scale-90">
                                            <item.icon className="h-7 w-7" />
                                        </div>
                                        <span className="mt-1 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex flex-1 flex-col items-center gap-1 transition-colors ${isActive ? "text-sky-500" : "text-slate-400"
                                }`}
                        >
                            <item.icon className={`h-6 w-6 ${isActive ? "animate-pulse" : ""}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={onMenuClick}
                    className="flex flex-1 flex-col items-center gap-1 text-slate-400 active:text-sky-500"
                >
                    <Menu className="h-6 w-6" />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </div>
        </nav>
    );
}