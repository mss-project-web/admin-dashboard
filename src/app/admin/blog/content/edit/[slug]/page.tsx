"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { blogService } from "@/services/blogService";
import { BlogGroup, BlogContentBlock } from "@/types/blog";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Save, Loader2, Image as ImageIcon, Trash2, Eye, Languages } from "lucide-react";
import { generateSlugFromThai } from "@/lib/translateSlug";
import Link from "next/link";
import Image from "next/image";
import BlogBlockEditor from "../../../components/BlogBlockEditor";
import TagInput from "../../../components/TagInput";
import BlogPreview from "../../../components/BlogPreview";
import GroupSelector from "../../../components/GroupSelector";
import { Button } from "@/app/components/ui/button";

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<BlogGroup[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const [blogId, setBlogId] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState("");
    const [content, setContent] = useState<BlogContentBlock[]>([{ type: 'paragraph', data: '' }]);
    const [isUploading, setIsUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [views, setViews] = useState(0);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    useEffect(() => {
        const loadData = async () => {
            try {
                const slug = params.slug as string;

                if (!slug) {
                    toast({ title: "ผิดพลาด", description: "ไม่พบ slug ของบทความ", variant: "destructive" });
                    router.push('/admin/blog/content');
                    return;
                }

                const [groupsData, blogData] = await Promise.all([
                    blogService.getGroups(),
                    blogService.getBySlug(slug)
                ]);

                setGroups(groupsData || []);

                if (blogData) {
                    setBlogId(blogData._id);
                    setTitle(blogData.title);
                    setSlug(blogData.slug || "");
                    setDescription(blogData.description || "");

                    // Handle group: could be string or object
                    const groupId = typeof blogData.group === 'string' ? blogData.group : blogData.group?._id || "";
                    setSelectedGroup(groupId);

                    setTags(blogData.tags || []);
                    setCoverImage(blogData.coverImage || "");
                    setViews(blogData.views || 0);
                    setStatus(blogData.status || 'draft');

                    if (Array.isArray(blogData.content)) {
                        setContent(blogData.content);
                    } else if (typeof blogData.content === 'string') {
                        // Legacy support: Wrap string content in a paragraph block
                        setContent([{ type: 'paragraph', data: blogData.content }]);
                    }
                } else {
                    toast({ title: "ผิดพลาด", description: "ไม่พบบทความที่ต้องการแก้ไข", variant: "destructive" });
                    router.push('/admin/blog/content');
                }
            } catch (error) {
                console.error("Failed to load data", error);
                toast({ title: "ผิดพลาด", description: "ไม่สามารถโหลดข้อมูลบทความได้", variant: "destructive" });
                router.push('/admin/blog/content');
            } finally {
                setInitializing(false);
            }
        };

        loadData();
    }, [params.slug, router, toast]);

    const handleCoverImageUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const result = await blogService.uploadImage(file);
            setCoverImage(result.url);
            toast({ title: "สำเร็จ", description: "อัปโหลดรูปปกเรียบร้อยแล้ว", variant: "default" });
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "อัปโหลดรูปปกไม่สำเร็จ", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
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

    const handleGroupCreated = (newGroup: BlogGroup) => {
        setGroups(prev => [...prev, newGroup]);
        setSelectedGroup(newGroup._id || newGroup.id || "");
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

            await blogService.update(blogId, blogData);
            toast({ title: "สำเร็จ", description: "แก้ไขบทความเรียบร้อยแล้ว", variant: "default" });
            router.push('/admin/blog/content');
        } catch (error: any) {
            console.error("Update blog error:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "ไม่สามารถบันทึกการแก้ไขได้";
            toast({ title: "ผิดพลาด", description: errorMsg, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

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

            <form onSubmit={handleSubmit} className="w-full space-y-4 space-y-4 md:space-y-6 pb-32">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-800 -mx-4 md:-mx-6 px-4 md:px-6">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Link href="/admin/blog/content" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0">
                            <ChevronLeft size={20} />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">แก้ไขบทความ</h1>
                            <p className="text-xs text-slate-500 hidden sm:block">อัปเดตเนื้อหาและรายละเอียด</p>
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
                        <Link href="/admin/blog/content" className="flex-1 sm:flex-none px-4 py-2 text-center text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg md:rounded-xl font-bold text-sm transition-colors pt-2.5">
                            ยกเลิก
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-sky-500 text-white rounded-lg md:rounded-xl font-bold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>บันทึกการแก้ไข</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <div className="bg-white dark:bg-slate-950 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">หัวข้อบทความ *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    const newTitle = e.target.value;
                                    setTitle(newTitle);
                                    // Only auto-generate if slug is empty OR user hasn't manually edited it (simplified: just check if title has Thai)
                                    // Actually, for Edit page, usually we don't auto-change slug when title changes unless it's a new draft, but let's stick to the requested logic:
                                    // "make it don't auto create slug from title if title is thai"
                                    // Since this is Edit page, maybe we shouldn't touch slug at all when title changes?
                                    // But if we do, we must follow the rule.
                                    // The previous code didn't have auto-slug on title change in EditPage (it just called setTitle).
                                    // So I will just keep it as is (no auto-slug on edit), or if I should, I'd apply the rule.
                                    // Looking at original code: `onChange={(e) => setTitle(e.target.value)}` -> No auto slug.
                                    // So I'll just leave this file alone regarding auto-slug, as it wasn't doing it before.
                                }}
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
                                    <span className="ml-2 text-xs font-normal text-slate-400">ระวัง! การเปลี่ยน slug จะทำให้ URL เก่าไม่สามารถเข้าถึงได้</span>
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
                                onChange={(e) => {
                                    const validSlug = e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
                                    setSlug(validSlug);
                                }}
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

                    <div className="space-y-4 md:space-y-6">
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

                        <div className="bg-white dark:bg-slate-950 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            {/* Views */}
                            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Eye size={16} className="text-sky-500" />
                                    <span className="font-medium">ยอดเข้าชม</span>
                                </div>
                                <span className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono">{views.toLocaleString()}</span>
                            </div>
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
                                    onGroupCreated={handleGroupCreated}
                                />
                            </div>

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
