"use client"

import Link from "next/link";
import { LayoutDashboard, Settings, Clock, Box, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { systemApi } from "@/lib/api/system";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function MenuPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [dbStatus, setDbStatus] = useState<string>("Checking...");
    const [dbColor, setDbColor] = useState<string>("text-slate-400");
    const [sysStatus, setSysStatus] = useState<string>("Checking...");
    const [sysColor, setSysColor] = useState<string>("text-slate-400");
    const [lastUpdated, setLastUpdated] = useState<string>("-");

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const health = await systemApi.getHealth();
                if (health?.data?.details?.mongo) {
                    setDbStatus("Online");
                    setDbColor("text-emerald-500");
                    setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                } else {
                    setDbStatus("Issue");
                    setDbColor("text-red-500");
                }
                const system = await systemApi.getSystem();
                if (system?.status === "success") {
                    setSysStatus("Online");
                    setSysColor("text-emerald-500");
                } else {
                    setSysStatus("Issue");
                    setSysColor("text-red-500");
                }

            } catch (error) {
                setDbStatus("Offline");
                setDbColor("text-red-500");
                setSysStatus("Offline");
                setSysColor("text-red-500");
            }
        };

        checkHealth();

        const interval = setInterval(checkHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await authApi.logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-32 md:px-8 md:pt-20">
                <section className="mt-12 mb-20">
                    {/* Section Header */}
                    <header className="mb-12 md:ml-6 flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-6">

                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold mb-4">
                                <Settings size={14} />
                                <span>Control Panel</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                ยินดีต้อนรับสู่ <span className="text-sky-500">MSS Admin</span>
                            </h1>
                            <div className="mt-2 space-y-2">
                                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
                                    ระบบจัดการหลังบ้านแบบครบวงจร <span className="text-sky-500 font-medium">เลือกเมนูที่คุณต้องการ</span> เพื่อเริ่มต้นทำงานได้อย่างรวดเร็ว
                                </p>

                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {/* จุดสีเขียวบอกสถานะ Online */}
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-end mt-4 lg:mt-0">
                            <button
                                onClick={handleLogout}
                                className="
                                    group cursor-pointer relative inline-flex items-center gap-2
                                    px-5 py-2.5
                                    bg-gradient-to-r from-red-500 to-rose-500
                                    text-white text-sm font-semibold
                                    rounded-xl
                                    shadow-md hover:shadow-lg
                                    transition-all duration-300
                                    hover:scale-105 active:scale-95
                                    focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
                                "
                            >
                                <LogOut size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                Sign Out
                            </button>
                        </div>
                    </header>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto px-4 md:px-6">
                        {[
                            {
                                id: "01",
                                icon: LayoutDashboard,
                                title: "แดชบอร์ดผู้ดูแลระบบ",
                                desc: "บริหารจัดการข้อมูลและภาพรวมของระบบทั้งหมด",
                                href: "/admin",
                                color: "group-hover:text-blue-500",
                                iconBg: "group-hover:bg-blue-500",
                            },
                            {
                                id: "02",
                                icon: Settings,
                                title: "การตั้งค่าระบบ",
                                desc: "กำหนดสิทธิ์ผู้ใช้งานและปรับแต่งการทำงานของระบบ",
                                href: "/admin/settings",
                                color: "group-hover:text-sky-500",
                                iconBg: "group-hover:bg-sky-500",
                            },
                            {
                                id: "03",
                                icon: Clock,
                                title: "ตารางเวลาละหมาด",
                                desc: "แสดงข้อมูลเวลาละหมาดประจำวันอย่างถูกต้องและเป็นปัจจุบัน",
                                href: "https://prayertime.msspsuhatyai.org",
                                color: "group-hover:text-blue-500",
                                iconBg: "group-hover:bg-blue-500",
                            },
                            {
                                id: "04",
                                icon: Box,
                                title: "ระบบบริหารสต๊อก",
                                desc: "ตรวจสอบข้อมูลและสถานะคงเหลือของสิ่งของในคลัง",
                                href: "https://stock.msspsuhatyai.org",
                                color: "group-hover:text-sky-500",
                                iconBg: "group-hover:bg-sky-500",
                            },
                        ].map((item, index) => (
                            <Link href={item.href} key={index} className="group">
                                <div className="relative h-full flex flex-col items-center text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-sky-200 dark:hover:border-sky-900 hover:shadow-2xl hover:shadow-sky-500/10">
                                    <div className="absolute top-4 font-black text-5xl text-slate-50 dark:text-slate-800/20 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 pointer-events-none">
                                        {item.id}
                                    </div>

                                    <div className={`relative mb-4 md:mb-6 inline-flex h-14 w-14 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 ring-1 ring-inset ring-slate-100 dark:ring-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:text-white group-hover:ring-transparent shadow-sm ${item.iconBg}`}>
                                        <item.icon className="h-7 w-7 md:h-10 md:w-10" />
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className={`mb-2 text-base md:text-xl font-bold text-slate-800 dark:text-white transition-colors ${item.color}`}>
                                            {item.title}
                                        </h3>

                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] md:text-sm line-clamp-2 md:line-clamp-none font-medium">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 transition-all duration-500 group-hover:w-[80%] rounded-full ${item.iconBg}`} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                {/* Footer Statistics (Optional) */}
                <footer className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center border-t border-slate-200 dark:border-slate-800 pt-10">

                    <div className="flex items-center justify-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-current ${sysColor} animate-pulse`} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ระบบทำงานปกติ:</span>
                        <span className={`text-xs font-black ${sysColor}`}>{sysStatus}</span>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-current ${dbColor} animate-pulse`} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ฐานข้อมูล:</span>
                        <span className={`text-xs font-black ${dbColor}`}>{dbStatus}</span>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-current text-slate-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">อัปเดตล่าสุด:</span>
                        <span className="text-xs font-black text-slate-400">{lastUpdated}</span>
                    </div>

                </footer>

            </div>
        </main>
    )
}