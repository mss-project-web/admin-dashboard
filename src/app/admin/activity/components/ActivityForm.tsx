"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Trash2,
  Image as ImageIcon,
  X,
  ChevronLeft,
} from "lucide-react";
import { ActivityListItem } from "@/types/activity";
import { activityService } from "@/services/activityService";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { FormHeader } from "@/app/components/ui/FormHeader";
import { toastUtils } from "@/lib/toast";
import { handleApiError } from "@/lib/axios";
import { useRouter } from "next/navigation";

interface ActivityFormProps {
  activityToEdit?: ActivityListItem | null;
  currentFavoriteCount: number;
}

export default function ActivityForm({
  activityToEdit,
  currentFavoriteCount,
}: ActivityFormProps) {
  const isEditMode = !!activityToEdit;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [originalImages, setOriginalImages] = useState<string[]>([]); // To track initial images for deletion logic

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
    favorite: false,
  });

  // Reset or Fetch Data
  useEffect(() => {
    if (activityToEdit) {
      // Fetch full details
      setIsFetchingDetail(true);
      activityService
        .getById(activityToEdit._id)
        .then((data) => {
          const loadedImages = data.images || [];
          setOriginalImages(loadedImages);

          let cleanObjectives = data.objectives || [""];
          let cleanGoals = data.goals || [""];

          try {
            if (
              cleanObjectives.length > 0 &&
              cleanObjectives[0].startsWith("[")
            ) {
              const combined = cleanObjectives.join(",");
              const parsed = JSON.parse(combined);
              if (Array.isArray(parsed)) cleanObjectives = parsed;
            }
          } catch (e) {
            console.warn("Failed to auto-fix objectives", e);
          }

          try {
            if (cleanGoals.length > 0 && cleanGoals[0].startsWith("[")) {
              const combined = cleanGoals.join(",");
              const parsed = JSON.parse(combined);
              if (Array.isArray(parsed)) cleanGoals = parsed;
            }
          } catch (e) {
            console.warn("Failed to auto-fix goals", e);
          }

          setFormData({
            name_th: data.name_th,
            name_eng: data.name_eng,
            location: data.location,
            description: data.description,
            participants: data.participants || 0,
            duration: data.duration || 0,
            start_date: data.start_date
              ? new Date(data.start_date).toISOString().slice(0, 16)
              : "",
            end_date: data.end_date
              ? new Date(data.end_date).toISOString().slice(0, 16)
              : "",
            images: loadedImages,
            objectives: cleanObjectives.length ? cleanObjectives : [""],
            goals: cleanGoals.length ? cleanGoals : [""],
            favorite: data.favorite,
          });
        })
        .catch((err) => {
          console.error(err);
          toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลกิจกรรมได้");
        })
        .finally(() => setIsFetchingDetail(false));
    }
  }, [activityToEdit]);

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
            throw new Error(
              "สามารถแนะนำกิจกรรมได้สูงสุด 4 รายการเท่านั้น (กรุณายกเลิกแนะนำกิจกรรมอื่นก่อน)",
            );
          }
        }
      }

      if (isEditMode && activityToEdit) {
        // Update: Use FormData via Service (PATCH)
        const existingUrls = formData.images.filter(
          (img) => typeof img === "string",
        ) as string[];
        const newImages = formData.images.filter(
          (img) => img instanceof File,
        ) as File[];
        const deletedImageUrls =
          originalImages.filter((url) => !existingUrls.includes(url)) || [];

        const payload = {
          name_th: formData.name_th,
          name_eng: formData.name_eng,
          location: formData.location,
          description: formData.description,
          participants: formData.participants,
          duration: formData.duration,
          start_date: formData.start_date,
          end_date: formData.end_date,
          favorite: formData.favorite,
          objectives: formData.objectives
            .filter((item) => item.trim() !== "")
            .join(","),
          goals: formData.goals.filter((item) => item.trim() !== "").join(","),
        };

        await activityService.update(
          activityToEdit._id,
          payload,
          newImages,
          deletedImageUrls,
        );
        toastUtils.success("สำเร็จ", "แก้ไขข้อมูลกิจกรรมเรียบร้อยแล้ว");
      } else {
        // Create: Use FormData (POST)
        const payload = new FormData();
        payload.append("name_th", formData.name_th);
        payload.append("name_eng", formData.name_eng);
        payload.append("location", formData.location);
        payload.append("description", formData.description);
        payload.append("participants", formData.participants.toString());
        payload.append("duration", formData.duration.toString());
        payload.append("start_date", formData.start_date);
        payload.append("end_date", formData.end_date);
        payload.append("favorite", formData.favorite.toString());

        // Append Arrays as Comma-Separated Strings
        const objectivesStr = formData.objectives
          .filter((item) => item.trim() !== "")
          .join(",");
        const goalsStr = formData.goals
          .filter((item) => item.trim() !== "")
          .join(",");

        if (objectivesStr) payload.append("objectives", objectivesStr);
        if (goalsStr) payload.append("goals", goalsStr);

        // Append Images
        formData.images.forEach((img) => {
          if (img instanceof File) {
            payload.append("images", img);
          } else {
            // Send existing URL as string - Backend must handle this!
            payload.append("images", img);
          }
        });

        await activityService.create(payload);
        toastUtils.success("สำเร็จ", "สร้างกิจกรรมใหม่เรียบร้อยแล้ว");
      }
      router.push("/admin/activity");
    } catch (err: any) {
      console.error(err);
      toastUtils.error("เกิดข้อผิดพลาด", handleApiError(err));
      setIsLoading(false);
    }
  };

  const handleArrayChange = (
    field: "objectives" | "goals",
    index: number,
    value: string,
  ) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: "objectives" | "goals") => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ""] });
  };

  const removeArrayItem = (field: "objectives" | "goals", index: number) => {
    const newArray = [...(formData[field] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate Files
      const validFiles = newFiles.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        );
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

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...validFiles],
      }));
      e.target.value = "";
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
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
        title={isEditMode ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
        backUrl="/admin/activity"
        formId="activity-form"
        isLoading={isLoading}
        saveLabel={isEditMode ? "บันทึกการแก้ไข" : "บันทึกกิจกรรม"}
      />

      <form
        id="activity-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 pb-32 w-full max-w-full"
      >
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: ข้อมูลกิจกรรมหลัก */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="w-1.5 h-5 bg-sky-500 rounded-full"></span>
              ข้อมูลกิจกรรมหลัก
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อกิจกรรม (TH) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                  value={formData.name_th}
                  onChange={(e) =>
                    setFormData({ ...formData, name_th: e.target.value })
                  }
                  placeholder="ชื่อกิจกรรมภาษาไทย"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Activity Name (ENG)
                </label>
                <input
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                  value={formData.name_eng}
                  onChange={(e) =>
                    setFormData({ ...formData, name_eng: e.target.value })
                  }
                  placeholder="English Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                สถานที่
              </label>
              <input
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="ระบุสถานที่จัดกิจกรรม"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                รายละเอียด
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="รายละเอียดกิจกรรม..."
              />
            </div>
          </div>

          {/* Card 2: Objectives & Goals */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
              วัตถุประสงค์และเป้าหมาย
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  วัตถุประสงค์
                </label>
                {formData.objectives?.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                      value={item}
                      onChange={(e) =>
                        handleArrayChange("objectives", idx, e.target.value)
                      }
                      placeholder={`วัตถุประสงค์ข้อที่ ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("objectives", idx)}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addArrayItem("objectives")}
                  className="text-xs text-sky-600 font-bold hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-700"
                >
                  + เพิ่มวัตถุประสงค์
                </Button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  เป้าหมาย
                </label>
                {formData.goals?.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                      value={item}
                      onChange={(e) =>
                        handleArrayChange("goals", idx, e.target.value)
                      }
                      placeholder={`เป้าหมายข้อที่ ${idx + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("goals", idx)}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors rounded-xl"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => addArrayItem("goals")}
                  className="text-xs text-sky-600 font-bold hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 w-full rounded-xl border border-dashed border-slate-200 dark:border-slate-700"
                >
                  + เพิ่มเป้าหมาย
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-6">
            {/* Card 3: รายละเอียดเวลาและผู้เข้าร่วม */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full"></span>
                ข้อมูลเพิ่มเติม
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  วันเวลาเริ่ม <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  วันเวลาสิ้นสุด <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ผู้เข้าร่วม (คน)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                    value={formData.participants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        participants: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ระยะเวลา (ชม.)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30 rounded-xl cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-sky-500 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                    checked={formData.favorite}
                    onChange={(e) =>
                      setFormData({ ...formData, favorite: e.target.checked })
                    }
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      แนะนำกิจกรรมนี้
                    </div>
                    <div className="text-xs text-slate-500">
                      แสดงในหน้าแรกของเว็บไซต์
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Card 4: รูปภาพ */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                  รูปภาพกิจกรรม
                </h2>
                <label className="cursor-pointer text-xs text-sky-600 font-bold hover:text-sky-700 bg-sky-50 px-2 py-1.5 rounded-lg transition-colors">
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
              <div className="text-xs font-medium text-slate-400 mb-2">
                (Max 3MB ต่อรูป, เลือกได้หลายรูป)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {formData.images?.map((img, idx) => {
                  const isFile = img instanceof File;
                  const src = isFile
                    ? URL.createObjectURL(img)
                    : (img as string);

                  return (
                    <div
                      key={idx}
                      className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group border border-slate-200 shadow-sm"
                    >
                      <Image
                        src={src}
                        alt="Activity Image"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                      <Button
                        type="button"
                        onClick={() => handleImageRemove(idx)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-600 p-1.5 rounded-full transition-all shadow-sm"
                      >
                        <X size={14} />
                      </Button>
                      {isFile && (
                        <div className="absolute bottom-0 left-0 right-0 bg-sky-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-1 py-1 text-center truncate">
                          New Upload
                        </div>
                      )}
                    </div>
                  );
                })}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-sky-50 rounded-xl text-slate-400 hover:text-sky-600 transition-all group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                  <ImageIcon
                    size={28}
                    className="group-hover:scale-110 transition-transform mb-2"
                  />
                  <span className="text-[10px] uppercase font-bold mt-1">
                    Upload
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
