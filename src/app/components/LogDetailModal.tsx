"use client";
import React from 'react';
import { X, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/app/components/ui/dialog";
import { toastUtils } from "@/lib/toast";

interface LogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: any;
}

export const LogDetailModal = ({ isOpen, onClose, log }: LogDetailModalProps) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
        toastUtils.success("Copied", "Log details copied to clipboard");
    };

    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <DialogHeader className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Log Details
                            <span className="text-xs font-mono font-normal bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-500">
                                {log._id}
                            </span>
                        </DialogTitle>
                        {/* Close button is handled by DialogClose or default X */}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">User Info</label>
                            <div className="font-medium text-slate-900 dark:text-white break-all">{log.details?.email || 'Anonymous'}</div>
                            <div className="text-xs text-slate-500 mt-1">{log.ip}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Action</label>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase 
                                    ${log.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                        log.action === 'Error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                            'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400'}`}>
                                    {log.action}
                                </span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{log.resource}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 break-all">{new Date(log.createdAt).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Raw Data */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw JSON Data</label>
                            <button
                                onClick={handleCopy}
                                className="text-xs flex items-center gap-1 text-sky-500 hover:text-sky-600 font-medium transition-colors"
                            >
                                <Copy size={12} /> Copy JSON
                            </button>
                        </div>
                        <div className="relative rounded-xl bg-slate-900 text-slate-50 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                            <pre>{JSON.stringify(log, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
