"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { blogService } from "@/services/blogService";
import { BlogGroup } from "@/types/blog";
import { useToast } from "@/hooks/use-toast";
import BlogForm from "../../components/BlogForm";

export default function CreateBlogPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [groups, setGroups] = useState<BlogGroup[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const data = await blogService.getGroups();
                setGroups(data || []);
            } catch (error) {
                console.error("Failed to load groups");
            }
        };
        fetchGroups();
    }, []);

    const handleGroupCreated = (newGroup: BlogGroup) => {
        setGroups(prev => [...prev, newGroup]);
    };

    const handleSubmit = async (blogData: any) => {
        try {
            await blogService.create(blogData);
            toast({ title: "สำเร็จ", description: "สร้างบทความเรียบร้อยแล้ว", variant: "default" });
            router.push('/admin/blog/content');
        } catch (error: any) {
            console.error("Create blog error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "ไม่สามารถสร้างบทความได้";
            toast({ title: "ผิดพลาด", description: errorMsg, variant: "destructive" });
            throw error; // Re-throw to let BlogForm handle loading state
        }
    };

    const handleCancel = () => {
        router.push('/admin/blog/content');
    };

    return (
        <BlogForm
            mode="create"
            groups={groups}
            onGroupCreated={handleGroupCreated}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
