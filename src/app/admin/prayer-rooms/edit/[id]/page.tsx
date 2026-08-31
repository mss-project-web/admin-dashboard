"use client";

import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/app/components/ui/FormSkeleton";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PrayerRoomForm from "../../components/PrayerRoomForm";
import { prayerRoomService } from "@/services/prayerRoomService";
import { PrayerRoom } from "@/types/prayer-room";
import { toastUtils } from "@/lib/toast";

export default function EditPrayerRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prayerRoom, setPrayerRoom] = useState<PrayerRoom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerRoom = async () => {
      try {
        const data = await prayerRoomService.getById(id);
        setPrayerRoom(data);
      } catch (error) {
        console.error(error);
        toastUtils.error(
          "ไม่พบข้อมูลห้องละหมาด",
          "เกิดข้อผิดพลาดในการดึงข้อมูล",
        );
        router.push("/admin/prayer-rooms");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrayerRoom();
    }
  }, [id, router]);

  return (
    <div className="w-full max-w-full space-y-6 pb-32">
      

      {loading ? (
        <FormSkeleton />
      ) : (
        <PrayerRoomForm prayerRoomToEdit={prayerRoom} />
      )}
    </div>
  );
}
