"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Pencil, Trash2, Search, Plus, X, Loader2 } from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogGroup } from "@/types/blog";
import { useToast } from "@/hooks/use-toast";

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupToEdit?: BlogGroup | null;
}

function GroupModal({ isOpen, onClose, onSuccess, groupToEdit }: GroupModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState(groupToEdit?.name || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (groupToEdit) {
                setName(groupToEdit.name);
            } else {
                setName("");
            }
        }
    }, [isOpen, groupToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            if (groupToEdit) {
                await blogService.updateGroup(groupToEdit._id || groupToEdit.id || "", name);
                toast({ title: "สำเร็จ", description: "แก้ไขหมวดหมู่เรียบร้อยแล้ว", variant: "default" });
            } else {
                await blogService.createGroup(name);
                toast({ title: "สำเร็จ", description: "เพิ่มหมวดหมู่เรียบร้อยแล้ว", variant: "default" });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast({ title: "ผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FolderPlus className="text-sky-500" />
                        {groupToEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            ชื่อหมวดหมู่
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="เช่น บทความ, ข่าวสาร, กิจกรรม"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {groupToEdit ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default GroupModal;
