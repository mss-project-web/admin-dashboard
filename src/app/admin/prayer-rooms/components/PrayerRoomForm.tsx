"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Trash2, Image as ImageIcon, X, ChevronLeft } from "lucide-react";
import { PrayerRoom } from "@/types/prayer-room";
import { prayerRoomService } from "@/services/prayerRoomService";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { FormHeader } from "@/app/components/ui/FormHeader";
import { toastUtils } from "@/lib/toast";
import { handleApiError } from "@/lib/axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const FACULTIES = [
    "คณะการจัดการสิ่งแวดล้อม",
    "คณะการแพทย์แผนไทย",
    "คณะทรัพยากรธรรมชาติ",
    "คณะทันตแพทยศาสตร์",
    "คณะนิติศาสตร์",
    "คณะพยาบาลศาสตร์",
    "คณะวิทยาการจัดการ",
    "คณะวิทยาศาสตร์",
    "คณะวิศวกรรมศาสตร์",
    "คณะศิลปศาสตร์",
    "คณะสัตวแพทยศาสตร์",
    "คณะอุตสาหกรรมเกษตร",
    "คณะเทคนิคการแพทย์",
    "คณะเภสัชศาสตร์",
    "คณะเศรษฐศาสตร์",
    "คณะแพทยศาสตร์",
    "บัณฑิตวิทยาลัย",
    "วิทยาลัยนานาชาติ"
];

const CAPACITIES = [
    { label: "เล็ก (ไม่เกิน 10 คน)", value: 10 },
    { label: "กลาง (11-30 คน)", value: 30 },
    { label: "ใหญ่ (31-50 คน)", value: 50 },
    { label: "ใหญ่มาก (50 คนขึ้นไป)", value: 100 }
];

// Leaflet touches `window`, so load the picker client-side only.
const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-72 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-sm text-slate-400">
            กำลังโหลดแผนที่...
        </div>
    ),
});

interface PrayerRoomFormProps {
    prayerRoomToEdit?: PrayerRoom | null;
}

export default function PrayerRoomForm({ prayerRoomToEdit }: PrayerRoomFormProps) {
    const isEditMode = !!prayerRoomToEdit;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const [formData, setFormData] = useState<{
        name: string;
        name_th: string;
        name_en: string;
        slug: string;
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
        name_th: "",
        name_en: "",
        slug: "",
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

    const [isCustomFaculty, setIsCustomFaculty] = useState(false);
    const [isCustomCapacity, setIsCustomCapacity] = useState(false);

    // Helpers for Opening Hours
    const [openDays, setOpenDays] = useState("จันทร์-ศุกร์");
    const [openTime, setOpenTime] = useState("09:00");
    const [closeTime, setCloseTime] = useState("18:00");
    const [isCustomOpeningHours, setIsCustomOpeningHours] = useState(false);

    useEffect(() => {
        if (prayerRoomToEdit) {
            // Fetch full details in case listing doesn't have everything or we want fresh data
            setIsFetchingDetail(true);
            prayerRoomService.getById(prayerRoomToEdit._id)
                .then((data) => {
                    setFormData({
                        name: data.name,
                        name_th: data.name_th || data.name,
                        name_en: data.name_en || "",
                        slug: data.slug || "",
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
        }
    }, [prayerRoomToEdit]);

    // Update opening hours string when selects change, unless in custom mode
    useEffect(() => {
        if (!isCustomOpeningHours && !isFetchingDetail && !prayerRoomToEdit) {
            setFormData(prev => ({
                ...prev,
                openingHours: `${openDays}: ${openTime}-${closeTime} น.`
            }));
        }
    }, [openDays, openTime, closeTime, isCustomOpeningHours, isFetchingDetail, prayerRoomToEdit]);

    useEffect(() => {
        if (prayerRoomToEdit && !isFetchingDetail) {
            // When editing, if it's not a standard format, set custom mode
            const match = formData.openingHours.match(/^(.*?):\s?(\d{2}:\d{2})\s?-\s?(\d{2}:\d{2})\s?น\.$/);
            if (match) {
                setOpenDays(match[1]);
                setOpenTime(match[2]);
                setCloseTime(match[3]);
                setIsCustomOpeningHours(false);
            } else if (formData.openingHours) {
                setIsCustomOpeningHours(true);
            }
            
            if (formData.faculty && !FACULTIES.includes(formData.faculty)) {
                setIsCustomFaculty(true);
            }
            if (formData.capacity && !CAPACITIES.find(c => c.value === formData.capacity)) {
                setIsCustomCapacity(true);
            }
        }
    }, [isFetchingDetail, formData.openingHours, formData.faculty, formData.capacity, prayerRoomToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.name_th || !formData.place) {
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
                    name_th: formData.name_th,
                    name_en: formData.name_en,
                    slug: formData.slug,
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
                payload.append('name_th', formData.name_th);
                payload.append('name_en', formData.name_en);
                payload.append('slug', formData.slug);
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
            router.push('/admin/prayer-rooms');
        } catch (err: any) {
            console.error(err);
            toastUtils.error("เกิดข้อผิดพลาด", handleApiError(err));
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

    // Bridge between the string form fields and the map picker (numeric).
    const latNum = formData.locationLat !== "" ? parseFloat(formData.locationLat) : NaN;
    const lngNum = formData.locationLng !== "" ? parseFloat(formData.locationLng) : NaN;
    const validLat = !isNaN(latNum) ? latNum : null;
    const validLng = !isNaN(lngNum) ? lngNum : null;
    const handleMapChange = (lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, locationLat: lat.toFixed(6), locationLng: lng.toFixed(6) }));
    };

    const handleGoogleMapUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, google_map_url: url }));
        
        // Pattern 1: /@lat,lng
        const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
            setFormData(prev => ({ ...prev, locationLat: atMatch[1], locationLng: atMatch[2] }));
            toastUtils.success("พบพิกัดจากลิงก์", "อัปเดตละติจูด/ลองจิจูดเรียบร้อย");
            return;
        }
        
        // Pattern 2: 3dlat!4dlng
        const dMatch = url.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (dMatch) {
            setFormData(prev => ({ ...prev, locationLat: dMatch[1], locationLng: dMatch[2] }));
            toastUtils.success("พบพิกัดจากลิงก์", "อัปเดตละติจูด/ลองจิจูดเรียบร้อย");
            return;
        }
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
                title={isEditMode ? 'แก้ไขข้อมูลห้องละหมาด' : 'เพิ่มห้องละหมาดใหม่'}
                backUrl="/admin/prayer-rooms"
                formId="prayer-room-form"
                isLoading={isLoading || isFetchingDetail}
                saveLabel={isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกบทความ'}
            />

            <form id="prayer-room-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 pb-28 lg:pb-0 w-full max-w-full">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Card 1: ข้อมูลทั่วไป (General Info) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="w-1.5 h-5 bg-sky-500 rounded-full"></span>
                            ข้อมูลทั่วไป
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อห้องละหมาด <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.name_th}
                                    onChange={e => setFormData({ ...formData, name: e.target.value, name_th: e.target.value })}
                                    placeholder="เช่น ตึกกิจกรรมนักศึกษา"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อภาษาอังกฤษ <span className="text-slate-400">(ใช้สร้าง URL)</span></label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.name_en}
                                    onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                                    placeholder="เช่น Student Activity Building Prayer Room"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug <span className="text-slate-400">(เว้นว่างเพื่อสร้างอัตโนมัติ)</span></label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="student-activity-building-prayer-room"
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
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={isCustomFaculty ? "other" : formData.faculty}
                                    onChange={(e) => {
                                        if (e.target.value === "other") {
                                            setIsCustomFaculty(true);
                                            setFormData(prev => ({ ...prev, faculty: "" }));
                                        } else {
                                            setIsCustomFaculty(false);
                                            setFormData(prev => ({ ...prev, faculty: e.target.value }));
                                        }
                                    }}
                                >
                                    <option value="">-- ไม่ระบุ --</option>
                                    {FACULTIES.map(fac => (
                                        <option key={fac} value={fac}>{fac}</option>
                                    ))}
                                    <option value="other">อื่นๆ (ระบุ)</option>
                                </select>
                                {isCustomFaculty && (
                                    <input
                                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.faculty}
                                        onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                        placeholder="ระบุชื่อคณะ หรือสถานที่..."
                                        autoFocus
                                    />
                                )}
                            </div>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ความจุ (คน)</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={isCustomCapacity ? "other" : formData.capacity}
                                        onChange={e => {
                                            if (e.target.value === "other") {
                                                setIsCustomCapacity(true);
                                            } else {
                                                setIsCustomCapacity(false);
                                                setFormData({ ...formData, capacity: Number(e.target.value) });
                                            }
                                        }}
                                    >
                                        <option value={0}>-- ไม่ระบุ --</option>
                                        {CAPACITIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                        <option value="other">อื่นๆ (ระบุตัวเลข)</option>
                                    </select>
                                    
                                    {isCustomCapacity && (
                                        <input
                                            type="number"
                                            className="w-24 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                            value={formData.capacity || ""}
                                            onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                            placeholder="ระบุ"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">เวลาเปิด-ปิด</label>
                                    <button 
                                        type="button" 
                                        className="text-xs text-sky-500 hover:underline"
                                        onClick={() => setIsCustomOpeningHours(!isCustomOpeningHours)}
                                    >
                                        {isCustomOpeningHours ? "ใช้รูปแบบมาตรฐาน" : "พิมพ์กำหนดเอง"}
                                    </button>
                                </div>
                                
                                {isCustomOpeningHours ? (
                                    <input
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                        value={formData.openingHours}
                                        onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                                        placeholder="ระบุเวลาเปิด-ปิดตามต้องการ"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <select 
                                            className="flex-1 px-1 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-1 focus:ring-sky-500"
                                            value={openDays}
                                            onChange={e => {
                                                setOpenDays(e.target.value);
                                                setFormData(prev => ({ ...prev, openingHours: `${e.target.value}: ${openTime}-${closeTime} น.` }));
                                            }}
                                        >
                                            <option value="ทุกวัน">ทุกวัน</option>
                                            <option value="จันทร์-ศุกร์">จันทร์-ศุกร์</option>
                                            <option value="เสาร์-อาทิตย์">เสาร์-อาทิตย์</option>
                                        </select>
                                        <input 
                                            type="time" 
                                            className="px-1 py-1.5 w-[75px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-1 focus:ring-sky-500"
                                            value={openTime}
                                            onChange={e => {
                                                setOpenTime(e.target.value);
                                                setFormData(prev => ({ ...prev, openingHours: `${openDays}: ${e.target.value}-${closeTime} น.` }));
                                            }}
                                        />
                                        <span className="text-slate-400 text-xs">-</span>
                                        <input 
                                            type="time" 
                                            className="px-1 py-1.5 w-[75px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:ring-1 focus:ring-sky-500"
                                            value={closeTime}
                                            onChange={e => {
                                                setCloseTime(e.target.value);
                                                setFormData(prev => ({ ...prev, openingHours: `${openDays}: ${openTime}-${e.target.value} น.` }));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">สิ่งอำนวยความสะดวก</label>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                                {formData.facilities.map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                            value={item}
                                            onChange={e => handleFacilitiesChange(idx, e.target.value)}
                                            placeholder={`สิ่งอำนวยความสะดวก ${idx + 1}`}
                                        />
                                        <button type="button" onClick={() => removeFacility(idx)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addFacility} className="text-xs text-sky-500 font-bold hover:bg-sky-50 dark:hover:bg-sky-500/10 px-3 py-1.5 rounded-lg transition-colors">
                                    + เพิ่มรายการสิ่งอำนวยความสะดวก
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: แผนที่และการติดต่อ (Map & Contact) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                            แผนที่และการติดต่อ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">YouTube URL (คลิปแนะนำสถานที่)</label>
                                <input
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                    value={formData.youtube_url}
                                    onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                    ดึงพิกัดอัตโนมัติจาก Google Maps
                                </label>
                                <p className="text-xs text-slate-500 mb-2">เพียงวางลิงก์ Google Maps ระบบจะดึงละติจูด/ลองจิจูด และปักหมุดให้ทันที</p>
                                <input
                                    className="w-full px-4 py-2.5 border border-sky-200 dark:border-sky-900/50 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans shadow-sm placeholder-slate-400"
                                    value={formData.google_map_url}
                                    onChange={handleGoogleMapUrlChange}
                                    placeholder="วางลิงก์ที่นี่ เช่น https://maps.app.goo.gl/... หรือลิงก์แบบยาว"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ละติจูด (Latitude)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans text-sm"
                                        value={formData.locationLat}
                                        onChange={e => setFormData({ ...formData, locationLat: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">ลองจิจูด (Longitude)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans text-sm"
                                        value={formData.locationLng}
                                        onChange={e => setFormData({ ...formData, locationLng: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0 shadow-inner">
                                <MapPicker lat={validLat} lng={validLng} onChange={handleMapChange} />
                            </div>
                            <p className="text-xs text-slate-500 text-center">คุณสามารถคลิกหรือเลื่อนหมุดบนแผนที่เพื่อปรับเปลี่ยนตำแหน่งได้ด้วยตัวเอง</p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar for Desktop) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-6">
                        {/* Card 3: รูปภาพ (Images) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
                                    รูปภาพ
                                </h2>
                                <label className="cursor-pointer text-xs text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                    + อัปโหลดรูปภาพ
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={handleImageFileChange}
                                    />
                                </label>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-4">(Max 3MB, รองรับ .jpg, .png, .webp)</p>
                            
                            {formData.images?.length === 0 ? (
                                <div className="aspect-video w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">ยังไม่มีรูปภาพ</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {formData.images?.map((img, idx) => {
                                        const isFile = img instanceof File;
                                        const src = isFile ? URL.createObjectURL(img) : img as string;
                                        return (
                                            <div key={idx} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <Image
                                                    src={src}
                                                    alt={`Image ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="128px"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImageRemove(idx)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all transform scale-90 group-hover:scale-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
    </>
    );
}
