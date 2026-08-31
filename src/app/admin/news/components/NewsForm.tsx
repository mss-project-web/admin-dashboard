"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, X, Image as ImageIcon, ChevronLeft } from "lucide-react";
import { News } from "@/types/news";
import { newsService } from "@/services/newsService";
import Image from "next/image";
import { FormHeader } from "@/app/components/ui/FormHeader";
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";
import { handleApiError } from "@/lib/axios";
import { useRouter } from "next/navigation";

interface NewsFormProps {
    newsToEdit?: News | null;
}

export default function NewsForm({ newsToEdit }: NewsFormProps) {
    const isEditMode = !!newsToEdit;
    const router = useRouter();
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
        }
    }, [newsToEdit]);

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
            router.push('/admin/news');
        } catch (err: any) {
            console.error(err);
            toastUtils.error("เกิดข้อผิดพลาด", handleApiError(err));
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

    if (isFetchingDetail) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    return (
    <>
            <FormHeader 
                title={isEditMode ? 'แก้ไขข่าวสาร' : 'สร้างบทความใหม่'}
                backUrl="/admin/news"
                formId="news-form"
                isLoading={isLoading}
                saveLabel={isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกบทความ'}
            />

            <form id="news-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 w-full max-w-full">
                {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
                {/* Card 1: เนื้อหาข่าว */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="w-1.5 h-5 bg-sky-500 rounded-full"></span>
                        ข้อมูลข่าวสาร
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">หัวข้อข่าว <span className="text-red-500">*</span></label>
                        <input
                            required
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="หัวข้อข่าว..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียดเนื้อหา</label>
                        <textarea
                            rows={8}
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="รายละเอียดข่าวสาร..."
                        />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
                <div className="space-y-6">
                    {/* Card 2: วันที่และลิงก์ */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                            ข้อมูลเพิ่มเติม
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่จัดกิจกรรม <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ลิงก์ภายนอก (ถ้ามี)</label>
                            <input
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                value={formData.link}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Card 3: รูปภาพ */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                                รูปภาพหน้าปก
                            </h2>
                            {formData.images.length === 0 && (
                                <label className="cursor-pointer text-xs text-sky-600 font-bold hover:text-sky-700 bg-sky-50 px-2 py-1.5 rounded-lg transition-colors">
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

                        <div className="space-y-2">
                            {formData.images.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {formData.images.map((img, idx) => {
                                        const isFile = img instanceof File;
                                        const src = isFile ? URL.createObjectURL(img) : img as string;
                                        return (
                                            <div key={idx} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border border-slate-200 shadow-sm">
                                                <Image
                                                    src={src}
                                                    alt="News Image"
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 300px"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageRemove(idx)}
                                                    className="absolute top-2 right-2 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-600 p-1.5 rounded-full transition-all shadow-sm"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50">
                                    <ImageIcon className="text-slate-300 mb-2" size={32} />
                                    <p className="text-sm text-slate-500 font-medium">ยังไม่มีรูปภาพ</p>
                                    <p className="text-xs text-slate-400 mt-1">ไฟล์ไม่เกิน 5MB (1 รูป)</p>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </div>
            </form>
    </>
    );
}
