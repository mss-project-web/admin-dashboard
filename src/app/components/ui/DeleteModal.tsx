"use client";

import { Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    itemName?: string;
    isDeleting: boolean;
    confirmText?: string;
    cancelText?: string;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "ยืนยันการลบ",
    description,
    itemName,
    isDeleting,
    confirmText = "ยืนยันลบ",
    cancelText = "ยกเลิก"
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                aria-hidden="true"
                onClick={isDeleting ? undefined : onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800 transform transition-all scale-100 opacity-100">
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 mb-6">
                        <Trash2 className="h-8 w-8 text-rose-600 dark:text-rose-500" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        {description} <br />
                        {itemName && <span className="font-semibold text-slate-700 dark:text-slate-300">"{itemName}"</span>}
                        {itemName && <><br />การกระทำนี้ไม่สามารถย้อนกลับได้</>}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังลบ...
                                </>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
