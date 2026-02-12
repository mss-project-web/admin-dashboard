"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { ActivityListItem } from "@/types/activity";
import { activityService } from "@/services/activityService";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    activityToEdit?: ActivityListItem | null; // Pass list item to trigger fetch
    currentFavoriteCount: number;
}

export default function ActivityModal({ isOpen, onClose, onSuccess, activityToEdit, currentFavoriteCount }: ActivityModalProps) {
    const isEditMode = !!activityToEdit;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    // Form States - Using a local type allowing mixed image types
    const [formData, setFormData] = useState<{
        name_th: string;
        name_eng: string;
        location: string;
        description: string;
        participants: number;
        duration: number;
        start_date: string;
        end_date: string;
        images: (string | File)[];
        objectives: string[];
        goals: string[];
        favorite: boolean;
    }>({
        name_th: "",
        name_eng: "",
        location: "",
        description: "",
        participants: 0,
        duration: 0,
        start_date: "",
        end_date: "",
        images: [],
        objectives: [""],
        goals: [""],
        favorite: false
    });

    // Reset or Fetch Data
    useEffect(() => {
        if (isOpen) {
            if (activityToEdit) {
                // Fetch full details
                setIsFetchingDetail(true);
                activityService.getById(activityToEdit._id)
                    .then((data) => {
                        setFormData({
                            name_th: data.name_th,
                            name_eng: data.name_eng,
                            location: data.location,
                            description: data.description,
                            participants: data.participants || 0,
                            duration: data.duration || 0,
                            start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : "",
                            end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
                            images: data.images || [],
                            objectives: data.objectives?.length ? data.objectives : [""],
                            goals: data.goals?.length ? data.goals : [""],
                            favorite: data.favorite
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                        toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลกิจกรรมได้");
                    })
                    .finally(() => setIsFetchingDetail(false));
            } else {
                // Reset for create
                setFormData({
                    name_th: "",
                    name_eng: "",
                    location: "",
                    description: "",
                    participants: 0,
                    duration: 0,
                    start_date: "",
                    end_date: "",
                    images: [],
                    objectives: [""],
                    goals: [""],
                    favorite: false
                });
            }
        }
    }, [isOpen, activityToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate essential fields
            if (!formData.name_th || !formData.start_date || !formData.end_date) {
                throw new Error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
            }

            // Validate Favorite Limit (Max 4)
            if (formData.favorite) {
                const isAlreadyFavorite = activityToEdit?.favorite; // Was it already favorite?
                // If creating new favorite OR editing non-favorite to favorite
                if (!isAlreadyFavorite) {
                    if (currentFavoriteCount >= 4) {
                        throw new Error("สามารถแนะนำกิจกรรมได้สูงสุด 4 รายการเท่านั้น (กรุณายกเลิกแนะนำกิจกรรมอื่นก่อน)");
                    }
                }
            }

            if (isEditMode && activityToEdit) {
                // Update: Use JSON Body (PATCH)
                // Note: File uploads might not be supported in this JSON PATCH unless backend supports base64 or separate endpoint
                const jsonPayload = {
                    name_th: formData.name_th,
                    name_eng: formData.name_eng,
                    location: formData.location,
                    description: formData.description,
                    participants: formData.participants,
                    duration: formData.duration,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    favorite: formData.favorite,
                    objectives: formData.objectives.filter(item => item.trim() !== ""),
                    goals: formData.goals.filter(item => item.trim() !== ""),
                    // Only send existing URL strings. New Files cannot be sent via JSON PATCH directly.
                    images: formData.images.filter(img => typeof img === 'string')
                };

                await activityService.update(activityToEdit._id, jsonPayload);

                toastUtils.success("สำเร็จ", "แก้ไขข้อมูลกิจกรรมเรียบร้อยแล้ว");

            } else {
                // Create: Use FormData (POST)
                const payload = new FormData();
                payload.append('name_th', formData.name_th);
                payload.append('name_eng', formData.name_eng);
                payload.append('location', formData.location);
                payload.append('description', formData.description);
                payload.append('participants', formData.participants.toString());
                payload.append('duration', formData.duration.toString());
                payload.append('start_date', formData.start_date);
                payload.append('end_date', formData.end_date);
                payload.append('favorite', formData.favorite.toString());

                // Append Arrays
                formData.objectives.forEach((item) => {
                    if (item.trim()) payload.append('objectives', item);
                });
                formData.goals.forEach((item) => {
                    if (item.trim()) payload.append('goals', item);
                });

                // Append Images
                formData.images.forEach((img) => {
                    if (img instanceof File) {
                        payload.append('images', img);
                    } else {
                        // Send existing URL as string - Backend must handle this!
                        payload.append('images', img);
                    }
                });

                await activityService.create(payload);

                toastUtils.success("สำเร็จ", "สร้างกิจกรรมใหม่เรียบร้อยแล้ว");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toastUtils.error("เกิดข้อผิดพลาด", err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleArrayChange = (field: 'objectives' | 'goals', index: number, value: string) => {
        const newArray = [...(formData[field] || [])];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: 'objectives' | 'goals') => {
        setFormData({ ...formData, [field]: [...(formData[field] || []), ""] });
    };

    const removeArrayItem = (field: 'objectives' | 'goals', index: number) => {
        const newArray = [...(formData[field] || [])];
        newArray.splice(index, 1);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Validate Files
            const validFiles = newFiles.filter(file => {
                const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB

                if (!isValidType) {
                    alert(`File type not supported: ${file.name} (Only JPG, PNG, WEBP)`);
                    return false;
                }
                if (!isValidSize) {
                    alert(`File too large: ${file.name} (Max 3MB)`);
                    return false;
                }
                return true;
            });

            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...validFiles] }));
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animation-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-none">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isEditMode ? <Edit2 size={24} className="text-sky-500" /> : <Plus size={24} className="text-emerald-500" />}
                        {isEditMode ? 'แก้ไขข้อมูลกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                        <X size={20} className="text-slate-500" />
                    </Button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isFetchingDetail ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                        </div>
                    ) : (
                        <form id="activity-form" onSubmit={handleSubmit} className="space-y-4">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อกิจกรรม (TH) <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.name_th}
                                        onChange={e => setFormData({ ...formData, name_th: e.target.value })}
                                        placeholder="ชื่อกิจกรรมภาษาไทย"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Name (ENG)</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.name_eng}
                                        onChange={e => setFormData({ ...formData, name_eng: e.target.value })}
                                        placeholder="English Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">สถานที่</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="ระบุสถานที่จัดกิจกรรม"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันเวลาเริ่ม <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">วันเวลาสิ้นสุด <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ผู้เข้าร่วม (คน)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.participants}
                                        onChange={e => setFormData({ ...formData, participants: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ระยะเวลา (ชม.)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="fav"
                                        className="w-5 h-5 text-sky-500 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                                        checked={formData.favorite}
                                        onChange={e => setFormData({ ...formData, favorite: e.target.checked })}
                                    />
                                    <label htmlFor="fav" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">แนะนำกิจกรรมนี้</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียด</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="รายละเอียดกิจกรรม..."
                                />
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        รูปภาพกิจกรรม <span className="text-xs font-normal text-slate-500">(Max 3MB, .jpg .png .webp)</span>
                                    </label>
                                    <label className="cursor-pointer text-xs text-sky-500 font-bold hover:underline bg-sky-50 px-2 py-1 rounded">
                                        + เพิ่มรูปภาพ
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handleImageFileChange}
                                        />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {formData.images?.map((img, idx) => {
                                        const isFile = img instanceof File;
                                        const src = isFile ? URL.createObjectURL(img) : img as string;

                                        return (
                                            <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden group border border-slate-200 shadow-sm">
                                                <Image
                                                    src={src}
                                                    alt="Activity Image"
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
                                                {isFile && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-sky-500/80 text-white text-[10px] px-1 py-0.5 text-center truncate">
                                                        New Upload
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50 rounded-lg text-slate-400 hover:text-sky-600 transition-all group cursor-pointer">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handleImageFileChange}
                                        />
                                        <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] uppercase font-bold mt-1">Upload</span>
                                    </label>
                                </div>
                            </div>

                            {/* Objectives & Goals */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">วัตถุประสงค์</label>
                                    {formData.objectives?.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                                value={item}
                                                onChange={e => handleArrayChange('objectives', idx, e.target.value)}
                                                placeholder={`วัตถุประสงค์ข้อที่ ${idx + 1}`}
                                            />
                                            <button type="button" onClick={() => removeArrayItem('objectives', idx)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addArrayItem('objectives')} className="text-xs text-sky-500 font-bold hover:underline">+ เพิ่มรายการ</button>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">เป้าหมาย</label>
                                    {formData.goals?.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                                value={item}
                                                onChange={e => handleArrayChange('goals', idx, e.target.value)}
                                                placeholder={`เป้าหมายข้อที่ ${idx + 1}`}
                                            />
                                            <button type="button" onClick={() => removeArrayItem('goals', idx)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addArrayItem('goals')} className="text-xs text-sky-500 font-bold hover:underline">+ เพิ่มรายการ</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-none bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        form="activity-form"
                        type="submit"
                        disabled={isLoading || isFetchingDetail}
                        className={isEditMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        {isEditMode ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
