"use client";

import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/app/components/ui/FormSkeleton";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ActivityForm from "../../components/ActivityForm";
import { activityService } from "@/services/activityService";
import { ActivityListItem } from "@/types/activity";
import { toastUtils } from "@/lib/toast";

export default function EditActivityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activity, setActivity] = useState<ActivityListItem | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the activity list item to pass to the form, and also all activities to count favorites
        const allActivities = await activityService.getAll();
        setFavoriteCount(allActivities.filter((a) => a.favorite).length);

        const foundActivity = allActivities.find((a) => a._id === id);
        if (foundActivity) {
          setActivity(foundActivity);
        } else {
          toastUtils.error(
            "ไม่พบข้อมูลกิจกรรม",
            "เกิดข้อผิดพลาดในการดึงข้อมูล",
          );
          router.push("/admin/activity");
        }
      } catch (error) {
        console.error(error);
        toastUtils.error("ไม่พบข้อมูลกิจกรรม", "เกิดข้อผิดพลาดในการดึงข้อมูล");
        router.push("/admin/activity");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      {loading ? (
        <FormSkeleton />
      ) : (
        <ActivityForm
          activityToEdit={activity}
          currentFavoriteCount={favoriteCount}
        />
      )}
    </div>
  );
}
