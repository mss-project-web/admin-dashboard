"use client";

import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/app/components/ui/FormSkeleton";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NewsForm from "../../components/NewsForm";
import { newsService } from "@/services/newsService";
import { News } from "@/types/news";
import { toastUtils } from "@/lib/toast";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getById(id);
        setNews(data);
      } catch (error) {
        console.error(error);
        toastUtils.error("ไม่พบข้อมูลข่าวสาร", "เกิดข้อผิดพลาดในการดึงข้อมูล");
        router.push("/admin/news");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id, router]);

  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      {loading ? (
        <FormSkeleton />
      ) : (
        <NewsForm newsToEdit={news} />
      )}
    </div>
  );
}
