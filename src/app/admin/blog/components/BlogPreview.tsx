"use client";

import { BlogContentBlock } from "@/types/blog";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface BlogPreviewProps {
    blocks: BlogContentBlock[];
    title: string;
    coverImage: string;
    onClose: () => void;
}

export default function BlogPreview({ blocks, onClose }: BlogPreviewProps) {
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 overflow-y-auto">
            {/* Header / Close Button */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-slate-800 dark:text-white">ตัวอย่างบทความ (Preview)</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X size={24} />
                </Button>
            </div>

            {/* Content Container */}
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">


                {/* Blocks Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                    {blocks.map((block, index) => {
                        if (block.type === 'paragraph') {
                            return (
                                <div
                                    key={index}
                                    dangerouslySetInnerHTML={{ __html: block.data as string }}
                                    className="leading-relaxed text-slate-700 dark:text-slate-300"
                                />
                            );
                        } else if (block.type === 'image') {
                            const data = block.data as { url: string; caption: string };
                            return (
                                <figure key={index} className="flex flex-col items-center my-8">
                                    {data.url && (
                                        <img
                                            src={data.url}
                                            alt={data.caption || "Blog Image"}
                                            className="w-full h-auto rounded-xl shadow-md"
                                        />
                                    )}
                                    {data.caption && (
                                        <figcaption className="mt-3 text-sm text-center text-slate-500 italic">
                                            {data.caption}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        }
                        return null;
                    })}
                </div>

            </div>
        </div>
    );
}
