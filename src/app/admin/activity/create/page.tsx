"use client";

import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/app/components/ui/FormSkeleton";

import { useEffect, useState } from "react";
import ActivityForm from "../components/ActivityForm";
import { activityService } from "@/services/activityService";

export default function CreateActivityPage() {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getAll();
        setFavoriteCount(data.filter((a) => a.favorite).length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      {loading ? (
        <FormSkeleton />
      ) : (
        <ActivityForm currentFavoriteCount={favoriteCount} />
      )}
    </div>
  );
}
