"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "พิมพ์ tag แล้วกดเพิ่ม..." }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInputValue("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="space-y-3">
            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
                <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!inputValue.trim()}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg font-bold text-sm hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">เพิ่ม</span>
                </Button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-lg text-sm font-medium group hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
                        >
                            <span>{tag}</span>
                            <Button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="p-0.5 hover:bg-sky-300 dark:hover:bg-sky-800 rounded transition-colors"
                            >
                                <X size={14} />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Helper Text */}
            <p className="text-xs text-slate-400">
                💡 กด Enter หรือคลิก "เพิ่ม" เพื่อเพิ่ม tag
            </p>
        </div>
    );
}
