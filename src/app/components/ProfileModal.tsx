"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2, Save, Mail, Phone, Shield, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // Editable fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await userService.getMe();
                setUser(data);
                setFirstName(data.firstName || "");
                setLastName(data.lastName || "");
                setPhoneNumber(data.phoneNumber || "");
            } catch (error) {
                console.error("Failed to load profile", error);
                toast({ title: "ผิดพลาด", description: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [isOpen, toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await userService.updateMe({ firstName, lastName, phoneNumber });
            setUser(updated);
            toast({ title: "สำเร็จ", description: "อัปเดตโปรไฟล์เรียบร้อยแล้ว", variant: "default" });
            onClose();
        } catch (error: any) {
            console.error("Update profile error:", error);
            const errorMsg = error?.response?.data?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้";
            toast({ title: "ผิดพลาด", description: errorMsg, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const roleLabel: Record<string, string> = {
        superadmin: "Super Admin",
        admin: "Admin",
        user: "User",
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">โปรไฟล์ของฉัน</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X size={18} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Body */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-sky-500" size={32} />
                        </div>
                    ) : user ? (
                        <div className="px-6 py-5 space-y-5">
                            {/* Avatar + Role */}
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white text-lg">{firstName} {lastName}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Shield size={12} />
                                        <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full font-medium">{roleLabel[user.role] || user.role}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Read-only fields */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 rounded-lg">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                {user.lastLoginAt && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 rounded-lg">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span>เข้าสู่ระบบล่าสุด: {format(new Date(user.lastLoginAt), 'dd MMM yy, HH:mm น.', { locale: th })}</span>
                                    </div>
                                )}
                            </div>

                            {/* Editable fields */}
                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">ชื่อ</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        placeholder="ชื่อ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">นามสกุล</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        placeholder="นามสกุล"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">เบอร์โทรศัพท์</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            maxLength={10}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            placeholder="0xx-xxx-xxxx"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center text-slate-400 text-sm">ไม่สามารถโหลดข้อมูลได้</div>
                    )}

                    {/* Footer */}
                    {!loading && user && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose} className="rounded-xl">ยกเลิก</Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-xl bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 flex items-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                บันทึก
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
