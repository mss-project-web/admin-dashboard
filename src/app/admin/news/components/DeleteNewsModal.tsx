"use client";

import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { newsService } from '@/services/newsService';
import { News } from '@/types/news';
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";



export default function DeleteNewsModal({ isOpen, onClose, onSuccess, newsToDelete }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; newsToDelete: News[] }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || newsToDelete.length === 0) return null;

    const handleDelete = async () => {
        setLoading(true);
        try {
            // Bulk delete using Promise.all
            await Promise.all(newsToDelete.map(news => newsService.delete(news._id)));

            toastUtils.success("สำเร็จ", `ลบข่าวสาร ${newsToDelete.length} รายการเรียบร้อยแล้ว`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Delete failed", error);
            toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถลบข่าวสารบางรายการได้");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animation-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ยืนยันการลบข่าวสาร?</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        คุณต้องการลบข่าวสาร {newsToDelete.length > 1 ? (
                            <span className="font-bold text-slate-700 dark:text-slate-300">จำนวน {newsToDelete.length} รายการ</span>
                        ) : (
                            <span><span className="font-bold text-slate-700 dark:text-slate-300">"{newsToDelete[0].name}"</span> ใช่หรือไม่?</span>
                        )}
                        <br />การกระทำนี้ไม่สามารถเรียกคืนได้
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button variant="ghost" onClick={onClose} disabled={loading}>
                            ยกเลิก
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading} className="text-white bg-red-500 hover:bg-red-700 dark:text-slate-400 dark:hover:text-slate-200">
                            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                            ลบ {newsToDelete.length} รายการ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
