"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center 
            bg-gradient-to-br from-sky-50 via-white to-sky-100 
            px-4">

            <div className="text-center max-w-lg bg-white/80 backdrop-blur-xl 
                rounded-3xl shadow-2xl p-10 border border-sky-100">

                {/* Title */}
                <h1 className="mb-4 text-6xl font-extrabold 
                    bg-gradient-to-r from-sky-500 to-blue-500 
                    bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="mb-2 text-2xl font-semibold text-slate-800">
                    ไม่พบหน้าที่คุณต้องการ
                </h2>

                <p className="mb-8 text-slate-500">
                    หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบออก หรือไม่มีอยู่ในระบบ
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 
                            rounded-xl 
                            bg-gradient-to-r from-sky-500 to-sky-600
                            px-6 py-3 
                            font-semibold text-white 
                            shadow-lg shadow-sky-200
                            transition-all duration-300
                            hover:from-sky-600 hover:to-sky-700
                            hover:scale-105 active:scale-95"
                    >
                        <Home className="h-5 w-5" />
                        กลับหน้าแรก
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 
                            rounded-xl cursor-pointer
                            border border-sky-200
                            bg-white
                            px-6 py-3 
                            font-semibold text-sky-600 
                            shadow-sm
                            transition-all duration-300
                            hover:bg-sky-50 hover:border-sky-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        ย้อนกลับ
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-10 text-sm text-slate-400">
                    หากพบปัญหา กรุณาติดต่อผู้ดูแลระบบ
                </div>

            </div>
        </div>
    );
}
