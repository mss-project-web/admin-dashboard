"use client";

import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/app/components/ui/FormSkeleton";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserForm from "../../components/UserForm";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { toastUtils } from "@/lib/toast";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUser(id);
        setUser(data);
      } catch (error) {
        console.error(error);
        toastUtils.error("ไม่พบข้อมูลผู้ใช้", "เกิดข้อผิดพลาดในการดึงข้อมูล");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, router]);

  return (
    <div className="pb-32 w-full max-w-full space-y-6">
      

      {loading ? (
        <FormSkeleton />
      ) : (
        <UserForm userToEdit={user} />
      )}
    </div>
  );
}
