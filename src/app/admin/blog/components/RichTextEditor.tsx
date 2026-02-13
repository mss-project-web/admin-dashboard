"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    List, ListOrdered, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Image as ImageIcon, Link as LinkIcon, Undo, Redo,
    Loader2, X, UploadCloud
} from 'lucide-react';
import { useState } from 'react';
import { blogService } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content = "", onChange, placeholder = "เริ่มเขียนบทความของคุณ..." }: RichTextEditorProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-sky-600 underline cursor-pointer',
                },
            }),
        ],
        content: content || "",
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const handleImageUpload = async (file: File) => {
        // ตรวจสอบ file type
        const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "ไฟล์ไม่รองรับ",
                description: "กรุณาเลือกไฟล์ .webp, .jpg หรือ .png เท่านั้น",
                variant: "destructive"
            });
            return;
        }

        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: "ไฟล์ใหญ่เกินไป",
                description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 3MB",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        try {
            const result = await blogService.uploadImage(file);
            const url = result.url;

            setUploadedImageUrl(url);
            setImageUrl(url);
            setShowImageDialog(true);

            toast({
                title: "✅ อัปโหลดสำเร็จ",
                description: "กดยืนยันเพื่อแทรกรูปเข้า Editor",
                variant: "default"
            });
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "อัปโหลดรูปภาพไม่สำเร็จ", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirmImage = () => {
        if (uploadedImageUrl) {
            editor?.chain().focus().setImage({ src: uploadedImageUrl }).run();
            setShowImageDialog(false);
            setImageUrl("");
            setUploadedImageUrl("");
            toast({ title: "สำเร็จ", description: "แทรกรูปเข้า Editor แล้ว", variant: "default" });
        }
    };

    const handleAddLink = () => {
        const url = window.prompt('ใส่ URL:');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    };

    if (!editor) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-sky-500" size={32} /></div>;
    }

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
            {/* Toolbar */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-sky-500 text-white' : ''}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-sky-500 text-white' : ''}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('underline') ? 'bg-sky-500 text-white' : ''}`}
                    title="Underline"
                >
                    <UnderlineIcon size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('strike') ? 'bg-sky-500 text-white' : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Headings */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Lists */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-sky-500 text-white' : ''}`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-sky-500 text-white' : ''}`}
                    title="Ordered List"
                >
                    <ListOrdered size={16} />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Alignment */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-sky-500 text-white' : ''}`}
                    title="Align Justify"
                >
                    <AlignJustify size={16} />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Media & Links */}
                <button
                    type="button"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/webp,image/jpeg,image/jpg,image/png';
                        input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) await handleImageUpload(file);
                        };
                        input.click();
                    }}
                    disabled={isUploading}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    title="Insert Image"
                >
                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                </button>
                <button
                    type="button"
                    onClick={handleAddLink}
                    className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('link') ? 'bg-sky-500 text-white' : ''}`}
                    title="Add Link"
                >
                    <LinkIcon size={16} />
                </button>

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
            </div>

            <EditorContent editor={editor} />

            {showImageDialog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-600 dark:text-sky-400">
                                    <ImageIcon size={20} />
                                </div>
                                <h2 className="font-semibold text-slate-800 dark:text-slate-200">ยืนยันการใช้รูปภาพ</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageDialog(false);
                                    setImageUrl("");
                                    setUploadedImageUrl("");
                                }}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {uploadedImageUrl && (
                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                    <img
                                        src={uploadedImageUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-md shadow-sm"
                                    />
                                </div>
                            )}
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 text-center">
                                รูปภาพนี้จะถูกแทรกลงใน Editor
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowImageDialog(false);
                                    setImageUrl("");
                                    setUploadedImageUrl("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmImage}
                                disabled={!uploadedImageUrl}
                                className="px-4 py-2 text-sm font-medium bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg shadow-sky-500/30 transition-all"
                            >
                                ยืนยันการใช้รูปนี้
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
