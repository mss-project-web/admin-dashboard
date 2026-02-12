"use client";
import React from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';

interface Content {
    _id: string;
    name_th: string;
    name_eng: string;
    images: string[];
    views: number;
}

interface PopularContentListProps {
    content: Content[];
}

export const PopularContentList = ({ content }: PopularContentListProps) => {
    return (
        <div className="space-y-4">
            {content.map((item, index) => (
                <div
                    key={item._id}
                    className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-transparent hover:border-sky-100 dark:hover:border-sky-900 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-md hover:shadow-sky-100/20 dark:hover:shadow-sky-900/10"
                >
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="absolute top-1 left-1 z-10 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            #{index + 1}
                        </span>
                        {item.images && item.images.length > 0 ? (
                            <Image
                                src={item.images[0]}
                                alt={item.name_eng}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="h-full w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                No Img
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm group-hover:text-sky-500 transition-colors" title={item.name_th}>
                            {item.name_th}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.name_eng}
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg bg-white dark:bg-slate-950 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/20 transition-colors">
                        <Eye size={14} className="text-slate-400 group-hover:text-sky-500 mb-0.5" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                            {item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                        </span>
                    </div>
                </div>
            ))}
            {content.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm">No popular content available</p>
                </div>
            )}
        </div>
    );
};
