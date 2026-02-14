"use client";

import { useState } from "react";
import { ChevronLeft, Save, Loader2, Image as ImageIcon, Trash2, Eye, Languages } from "lucide-react";
import { BlogGroup, BlogContentBlock } from "@/types/blog";
import { blogService } from "@/services/blogService";
import { useToast } from "@/hooks/use-toast";
import { generateSlugFromThai } from "@/lib/translateSlug";
import Link from "next/link";
import Image from "next/image";
import BlogBlockEditor from "./BlogBlockEditor";
import TagInput from "./TagInput";
import BlogPreview from "./BlogPreview";
import GroupSelector from "./GroupSelector";
import { Button } from "@/app/components/ui/button";

interface BlogFormProps {
    mode: "create" | "edit";
    initialData?: {
        id?: string;
        title?: string;
        slug?: string;
        description?: string;
        group?: string;
        tags?: string[];
        coverImage?: string;
        content?: BlogContentBlock[];
        status?: "draft" | "published";
        views?: number;
    };
    groups: BlogGroup[];
    onGroupCreated: (group: BlogGroup) => void;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function BlogForm({
    mode,
    initialData,
    groups,
    onGroupCreated,
    onSubmit,
    onCancel
}: BlogFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Form State
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [selectedGroup, setSelectedGroup] = useState(initialData?.group || "");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
    const [content, setContent] = useState<BlogContentBlock[]>(
        initialData?.content || [{ type: 'paragraph', data: '' }]
    );
    const [isUploading, setIsUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');

    // Auto-generate slug from title (only for create mode)
    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (mode === "create") {
            const hasThai = /[\u0E00-\u0E7F]/.test(newTitle);
            if (!hasThai) {
                const generatedSlug = newTitle
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9\-]/g, '')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                setSlug(generatedSlug);
            }
        }
    };

    const handleSlugChange = (value: string) => {
        const validSlug = value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
        setSlug(validSlug);
    };

    const handleGenerateSlug = async () => {
        if (!title.trim()) return;
        setTranslating(true);
        try {
            const generatedSlug = await generateSlugFromThai(title);
            setSlug(generatedSlug);
            toast({ title: "สำเร็จ", description: "สร้าง slug จากการแปลหัวข้อเรียบร้อย", variant: "default" });
        } catch (error: any) {
            toast({ title: "ผิดพลาด", description: error.message || "ไม่สามารถแปลหัวข้อได้", variant: "destructive" });
        } finally {
            setTranslating(false);
        }
    };

    const handleCoverImageUpload = async (file: File) => {
        const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "ไฟล์ไม่รองรับ",
                description: "กรุณาเลือกไฟล์ .webp, .jpg หรือ .png เท่านั้น",
                variant: "destructive"
            });
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: "ไฟล์ใหญ่เกินไป",
                description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        try {
            const result = await blogService.uploadImage(file);
            setCoverImage(result.url);
            toast({ title: "สำเร็จ", description: "อัปโหลดรูปปกเรียบร้อย", variant: "default" });
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "อัปโหลดรูปปกไม่สำเร็จ", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !selectedGroup) {
            toast({ title: "ข้อมูลไม่ครบ", description: "กรุณากรอกหัวข้อและเลือกหมวดหมู่", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const blogData = {
                title,
                slug,
                description,
                group: selectedGroup,
                tags,
                coverImage,
                content,
                status,
            };

            await onSubmit(blogData);
        } catch (error) {
            // Error already handled by parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showPreview && (
                <BlogPreview
                    blocks={content}
                    title={title}
                    coverImage={coverImage}
                    onClose={() => setShowPreview(false)}
                />
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6 pb-32">
                {/* Header - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-800 -mx-4 md:-mx-6 px-4 md:px-6">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link href="/admin/blog/content" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0">
                            <ChevronLeft size={20} />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">
                                {mode === "create" ? "สร้างบทความใหม่" : "แก้ไขบทความ"}
                            </h1>
                            <p className="text-xs text-slate-500 hidden sm:block">
                                {mode === "create" ? "เพิ่มเนื้อหาและรายละเอียด" : "อัปเดตเนื้อหาและรายละเอียด"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(true)}
                            className="flex-1 sm:flex-none gap-2"
                        >
                            <Eye size={18} />
                            <span>Preview</span>
                        </Button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 sm:flex-none px-4 py-2 text-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg md:rounded-xl font-bold text-sm transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-sky-500 text-white rounded-lg md:rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{mode === "create" ? "บันทึกบทความ" : "บันทึกการแก้ไข"}</span>
                        </Button>
                    </div>
                </div>

                {/* Desktop: 2 Column Layout | Mobile: Stack Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {/* Left Column: Main Content (Desktop 2/3 width) */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Title */}
                        <div className="bg-white dark:bg-slate-950 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หัวข้อบทความ *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="ใส่หัวข้อบทความที่น่าสนใจ..."
                                className="w-full text-lg md:text-xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:font-normal"
                                required
                            />
                        </div>

                        {/* Slug Field */}
                        <div className="bg-white dark:bg-slate-950 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Slug (URL) *
                                    <span className="ml-2 text-xs font-normal text-slate-400">
                                        {mode === "create"
                                            ? "Auto-generated จากหัวข้อ"
                                            : "ระวัง! การเปลี่ยน slug จะทำให้ URL เก่าไม่สามารถเข้าถึงได้"}
                                    </span>
                                </label>
                                {/[\u0E00-\u0E7F]/.test(title) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateSlug}
                                        disabled={translating || !title.trim()}
                                        className="gap-1.5 text-xs h-7 px-2.5 border-sky-200 text-sky-600 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950 flex-shrink-0"
                                    >
                                        {translating ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
                                        แปลเป็น Slug
                                    </Button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                placeholder="my-blog-post-slug"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono text-sm"
                                required
                            />
                            <p className="mt-2 text-xs text-slate-400">
                                💡 URL: <span className="text-sky-500">/blog/{slug || "..."}</span>
                            </p>
                        </div>

                        {/* Content Editor */}
                        <BlogBlockEditor blocks={content} onChange={setContent} />
                    </div>

                    {/* Right Column: Settings & Metadata (Desktop 1/3 width) */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Cover Image */}
                        <div className="bg-white dark:bg-slate-950 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">รูปปก (Cover Image)</label>
                            {coverImage ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                    <Image src={coverImage} alt="Cover" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            onClick={() => setCoverImage('')}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative cursor-pointer">
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-sky-500" size={32} />
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="mb-2" />
                                            <span className="text-sm text-center">แตะเพื่ออัปโหลดรูปปก</span>
                                            <span className="text-xs text-slate-400 mt-1">รองรับ WebP, JPG, PNG (สูงสุด 5MB)</span>
                                            <input
                                                type="file"
                                                accept="image/webp,image/jpeg,image/jpg,image/png"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => e.target.files?.[0] && handleCoverImageUpload(e.target.files[0])}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Settings Card */}
                        <div className="bg-white dark:bg-slate-950 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            {/* Views (Edit mode only) */}
                            {mode === "edit" && initialData?.views !== undefined && (
                                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Eye size={16} className="text-sky-500" />
                                        <span className="font-medium">ยอดเข้าชม</span>
                                    </div>
                                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono">{initialData.views.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Status Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">สถานะ</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('draft')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${status === 'draft'
                                            ? 'bg-amber-100 text-amber-700 border-2 border-amber-400 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600'
                                            : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400'
                                            }`}
                                    >
                                        📝 Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('published')}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${status === 'published'
                                            ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600'
                                            : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400'
                                            }`}
                                    >
                                        🌐 Published
                                    </button>
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400">
                                    {status === 'draft' ? 'บทความจะยังไม่แสดงบนหน้าเว็บ' : 'บทความจะแสดงบนหน้าเว็บทันที'}
                                </p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หมวดหมู่ *</label>
                                <GroupSelector
                                    groups={groups}
                                    value={selectedGroup}
                                    onChange={setSelectedGroup}
                                    onGroupCreated={onGroupCreated}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">คำอธิบายย่อ</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 text-sm resize-none"
                                    placeholder="คำโปรยสั้นๆ..."
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tags</label>
                                <TagInput
                                    tags={tags}
                                    onChange={setTags}
                                    placeholder="พิมพ์ tag เช่น อิสลาม, ข่าวสาร..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
