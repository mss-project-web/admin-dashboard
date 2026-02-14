"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { PrayerRoom } from "@/types/prayer-room";
import { prayerRoomService } from "@/services/prayerRoomService";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";
import { handleApiError } from "@/lib/axios";

interface PrayerRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prayerRoomToEdit?: PrayerRoom | null;
}

export default function PrayerRoomModal({ isOpen, onClose, onSuccess, prayerRoomToEdit }: PrayerRoomModalProps) {
    const isEditMode = !!prayerRoomToEdit;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const [formData, setFormData] = useState<{
        name: string;
        place: string;
        detail: string;
        faculty: string;
        locationLat: string; // Keep as string for input handling
        locationLng: string; // Keep as string for input handling
        openingHours: string;
        images: (string | File)[];
        youtube_url: string;
        capacity: number;
        google_map_url: string;
        facilities: string[];
        phone: string;
    }>({
        name: "",
        place: "",
        detail: "",
        faculty: "",
        locationLat: "",
        locationLng: "",
        openingHours: "",
        images: [],
        youtube_url: "",
        capacity: 0,
        google_map_url: "",
        facilities: [""],
        phone: ""
    });

    useEffect(() => {
        if (isOpen) {
            if (prayerRoomToEdit) {
                // Fetch full details in case listing doesn't have everything or we want fresh data
                setIsFetchingDetail(true);
                prayerRoomService.getById(prayerRoomToEdit._id)
                    .then((data) => {
                        setFormData({
                            name: data.name,
                            place: data.place,
                            detail: data.detail,
                            faculty: data.faculty || "",
                            locationLat: data.location?.[0]?.toString() || "",
                            locationLng: data.location?.[1]?.toString() || "",
                            openingHours: data.openingHours,
                            images: data.images || [],
                            youtube_url: data.youtube_url || "",
                            capacity: data.capacity || 0,
                            google_map_url: data.google_map_url || "",
                            facilities: data.facilities?.length ? data.facilities : [""],
                            phone: data.phone || ""
                        });
                    })
                    .catch((err) => {
                        console.error(err);
                        toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลห้องละหมาดได้");
                    })
                    .finally(() => setIsFetchingDetail(false));
            } else {
                // Reset for create
                setFormData({
                    name: "",
                    place: "",
                    detail: "",
                    faculty: "",
                    locationLat: "",
                    locationLng: "",
                    openingHours: "",
                    images: [],
                    youtube_url: "",
                    capacity: 0,
                    google_map_url: "",
                    facilities: [""],
                    phone: ""
                });
            }
        }
    }, [isOpen, prayerRoomToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.name || !formData.place) {
                throw new Error("กรุณากรอกชื่อและสถานที่");
            }

            const lat = parseFloat(formData.locationLat);
            const lng = parseFloat(formData.locationLng);
            const location: [number, number] = [isNaN(lat) ? 0 : lat, isNaN(lng) ? 0 : lng];

            if (isEditMode && prayerRoomToEdit) {
                // Update: Use FormData via Service
                const existingUrls = formData.images.filter(img => typeof img === 'string') as string[];
                const newImages = formData.images.filter(img => img instanceof File) as File[];
                const deletedImageUrls = prayerRoomToEdit.images?.filter(url => !existingUrls.includes(url)) || [];

                const payload = {
                    name: formData.name,
                    place: formData.place,
                    detail: formData.detail,
                    faculty: formData.faculty,
                    location: location,
                    openingHours: formData.openingHours,
                    youtube_url: formData.youtube_url,
                    capacity: formData.capacity,
                    google_map_url: formData.google_map_url,
                    facilities: formData.facilities.filter(item => item.trim() !== ""),
                    phone: formData.phone
                };

                await prayerRoomService.update(prayerRoomToEdit._id, payload, newImages, deletedImageUrls);
                toastUtils.success("สำเร็จ", "แก้ไขข้อมูลห้องละหมาดเรียบร้อยแล้ว");

            } else {
                // Create: Use FormData
                const payload = new FormData();
                payload.append('name', formData.name);
                payload.append('place', formData.place);
                payload.append('detail', formData.detail);
                payload.append('faculty', formData.faculty);
                payload.append('location[0]', location[0].toString());
                payload.append('location[1]', location[1].toString());
                payload.append('openingHours', formData.openingHours);
                payload.append('youtube_url', formData.youtube_url);
                payload.append('capacity', formData.capacity.toString());
                payload.append('google_map_url', formData.google_map_url);
                payload.append('phone', formData.phone);

                formData.facilities.forEach((item) => {
                    if (item.trim()) payload.append('facilities', item);
                });

                formData.images.forEach((img) => {
                    if (img instanceof File) {
                        payload.append('images', img);
                    } else {
                        payload.append('images', img);
                    }
                });

                await prayerRoomService.create(payload);
                toastUtils.success("สำเร็จ", "สร้างห้องละหมาดใหม่เรียบร้อยแล้ว");
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

    // Helper functions for array fields and images
    const handleFacilitiesChange = (index: number, value: string) => {
        const newFacilities = [...formData.facilities];
        newFacilities[index] = value;
        setFormData({ ...formData, facilities: newFacilities });
    };

    const addFacility = () => {
        setFormData({ ...formData, facilities: [...formData.facilities, ""] });
    };

    const removeFacility = (index: number) => {
        const newFacilities = [...formData.facilities];
        newFacilities.splice(index, 1);
        setFormData({ ...formData, facilities: newFacilities });
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            // Validation logic...
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newFiles] }));
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
        <div className="fixed inset-0 z-[9990] flex items-center m-0 justify-center bg-black/50 backdrop-blur-sm p-4 animation-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-none">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isEditMode ? <Edit2 size={24} className="text-sky-500" /> : <Plus size={24} className="text-emerald-500" />}
                        {isEditMode ? 'แก้ไขข้อมูลห้องละหมาด' : 'เพิ่มห้องละหมาดใหม่'}
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
                        <form id="prayer-room-form" onSubmit={handleSubmit} className="space-y-4">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อห้องละหมาด <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="เช่น ตึกกิจกรรมนักศึกษา"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">สถานที่ตั้ง <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.place}
                                        onChange={e => setFormData({ ...formData, place: e.target.value })}
                                        placeholder="เช่น ชั้น 2 ตึกกิจกรรม"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">คณะ (ถ้ามี)</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.faculty}
                                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                    placeholder="เช่น คณะวิทยาการจัดการ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียดเพิ่มเติม</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.detail}
                                    onChange={e => setFormData({ ...formData, detail: e.target.value })}
                                    placeholder="รายละเอียดการเข้าใช้งาน หรือจุดสังเกต"
                                />
                            </div>

                            {/* Location & Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ละติจูด (Lat)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                            value={formData.locationLat}
                                            onChange={e => setFormData({ ...formData, locationLat: e.target.value })}
                                            placeholder="7.01128"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ลองจิจูด (Lng)</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                            value={formData.locationLng}
                                            onChange={e => setFormData({ ...formData, locationLng: e.target.value })}
                                            placeholder="100.49955"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.phone}
                                        maxLength={10}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="094-xxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Hours & Map */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เวลาเปิด-ปิด</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.openingHours}
                                        onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                                        placeholder="เช่น จันทร์-ศุกร์: 09.00-20.00 น."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Google Map URL</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.google_map_url}
                                        onChange={e => setFormData({ ...formData, google_map_url: e.target.value })}
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>
                            </div>

                            {/* Extra Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ความจุ (คน)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">YouTube URL (แนะนำสถานที่)</label>
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.youtube_url}
                                        onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Facilities */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">สิ่งอำนวยความสะดวก</label>
                                {formData.facilities.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                            value={item}
                                            onChange={e => handleFacilitiesChange(idx, e.target.value)}
                                            placeholder={`สิ่งอำนวยความสะดวก ${idx + 1}`}
                                        />
                                        <button type="button" onClick={() => removeFacility(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addFacility} className="text-xs text-sky-500 font-bold hover:underline">+ เพิ่มรายการ</button>
                            </div>

                            {/* Images - Similar to ActivityModal */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        รูปภาพ <span className="text-xs font-normal text-slate-500">(Max 3MB, .jpg .png .webp)</span>
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
                                                    alt="Prayer Room Image"
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
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>ยกเลิก</Button>
                    <Button
                        form="prayer-room-form"
                        type="submit"
                        disabled={isLoading || isFetchingDetail}
                        className={isEditMode ? 'text-white bg-sky-500 hover:bg-sky-600' : 'text-white bg-emerald-500 hover:bg-emerald-600'}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                        {isEditMode ? 'บันทึกการแก้ไข' : 'สร้างห้องละหมาด'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
