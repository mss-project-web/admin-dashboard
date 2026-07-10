"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Edit2, Image as ImageIcon } from "lucide-react";
import { News } from "@/types/news";
import { newsService } from "@/services/newsService";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";
import { handleApiError } from "@/lib/axios";

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    newsToEdit?: News | null;
}

export default function NewsModal({ isOpen, onClose, onSuccess, newsToEdit }: NewsModalProps) {
    const isEditMode = !!newsToEdit;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        date: string;
        link: string;
        images: (string | File)[];
    }>({
        name: "",
        description: "",
        date: "",
        link: "",
        images: []
    });

    useEffect(() => {
        if (isOpen) {
            if (newsToEdit) {
                setIsFetchingDetail(true);
                newsService.getById(newsToEdit._id)
                    .then((data) => {
                        setFormData({
                            name: data.name,
                            description: data.description,
                            date: data.date ? new Date(data.date).toISOString().slice(0, 16) : "",
                            link: data.link || "",
                            images: data.images || []
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                        toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลข่าวสารได้");
                    })
                    .finally(() => setIsFetchingDetail(false));
            } else {
                setFormData({
                    name: "",
                    description: "",
                    date: "",
                    link: "",
                    images: []
                });
            }
        }
    }, [isOpen, newsToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.name || !formData.date) {
                throw new Error("กรุณากรอกหัวข้อข่าวและวันที่");
            }

            if (isEditMode && newsToEdit) {
                // Update: Use FormData via Service (PATCH)
                const existingUrls = formData.images.filter(img => typeof img === 'string') as string[];
                const newImages = formData.images.filter(img => img instanceof File) as File[];
                const deletedImageUrls = newsToEdit.images?.filter(url => !existingUrls.includes(url)) || [];

                const payload = {
                    name: formData.name,
                    description: formData.description,
                    date: formData.date,
                    link: formData.link
                };

                await newsService.update(newsToEdit._id, payload, newImages, deletedImageUrls);
                toastUtils.success("สำเร็จ", "แก้ไขข่าวสารเรียบร้อยแล้ว");

            } else {
                // Create: Use FormData (POST)
                const payload = new FormData();
                payload.append('name', formData.name);
                payload.append('description', formData.description);
                payload.append('date', formData.date);
                payload.append('link', formData.link);

                formData.images.forEach((img) => {
                    if (img instanceof File) {
                        payload.append('images', img);
                    } else {
                        payload.append('images', img);
                    }
                });

                await newsService.create(payload);
                toastUtils.success("สำเร็จ", "สร้างข่าวสารใหม่เรียบร้อยแล้ว");
            }
            onSuccess();
            onClose();


            // ... existing imports

        } catch (err: any) {
            console.error(err);
            toastUtils.error("เกิดข้อผิดพลาด", handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toastUtils.warning("คำเตือน", "ไฟล์มีขนาดเกิน 5MB");
                return;
            }
            // Replace existing images with the new one
            setFormData(prev => ({ ...prev, images: [file] }));
            e.target.value = '';
        }
    };

    const handleImageRemove = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9990] flex items-center m-0 justify-center bg-black/50 backdrop-blur-sm animation-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-none">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isEditMode ? <Edit2 size={24} className="text-sky-500" /> : <Plus size={24} className="text-emerald-500" />}
                        {isEditMode ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวสารใหม่'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                        <X size={20} className="text-slate-500" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isFetchingDetail ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                        </div>
                    ) : (
                        <form id="news-form" onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อข่าว <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="หัวข้อข่าว..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่จัดกิจกรรม <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ลิงก์ภายนอก (ถ้ามี)</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียดเนื้อหา</label>
                                <textarea
                                    rows={6}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="รายละเอียดข่าวสาร..."
                                />
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        รูปภาพหน้าปก <span className="text-xs font-normal text-slate-500">(Max 5MB, 1 รูป)</span>
                                    </label>
                                    {formData.images.length === 0 && (
                                        <label className="cursor-pointer text-xs text-sky-500 font-bold hover:underline bg-sky-50 px-2 py-1 rounded">
                                            + เพิ่มรูปภาพ
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                className="hidden"
                                                onChange={handleImageFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {formData.images?.map((img, idx) => {
                                        const isFile = img instanceof File;
                                        const src = isFile ? URL.createObjectURL(img) : img as string;
                                        return (
                                            <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden group border border-slate-200 shadow-sm">
                                                <Image
                                                    src={src}
                                                    alt="News Image"
                                                    fill
                                                    className="object-cover"
                                                    sizes="128px"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageRemove(idx)}
                                                    className="absolute top-1 right-1 bg-white/80 hover:bg-red-500 hover:text-white text-slate-500 p-1 rounded-full transition-all shadow-sm"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-none bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading} >ยกเลิก</Button>
                    <Button
                        form="news-form"
                        type="submit"
                        disabled={isLoading || isFetchingDetail}
                        className={isEditMode ? 'text-white bg-sky-500 hover:bg-sky-600' : 'text-white bg-emerald-500 hover:bg-emerald-600'}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        {isEditMode ? 'บันทึกการแก้ไข' : 'สร้างข่าวสาร'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
