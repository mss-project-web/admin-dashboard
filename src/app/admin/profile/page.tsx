"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Clock, Save, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import { User as UserType } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
    const { toast } = useToast();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const me = await userService.getMe();
                setUser(me);
                setFirstName(me.firstName || "");
                setLastName(me.lastName || "");
                setPhoneNumber(me.phoneNumber || "");
            } catch {
                toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const updated = await userService.updateMe({ firstName, lastName, phoneNumber });
            setUser(updated);
            toast({ title: "สำเร็จ", description: "อัปเดตโปรไฟล์เรียบร้อยแล้ว" });
        } catch {
            toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตโปรไฟล์ได้", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const roleLabel: Record<string, string> = {
        superadmin: "Super Admin",
        admin: "Admin",
        user: "User",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-32">
            {/* Header */}
            <div className="px-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                    โปรไฟล์ของฉัน
                </h2>
            </div>

            {/* Avatar Card */}
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/40">
                        {initials}
                    </div>
                    <div>
                        <div className="text-lg font-bold">{firstName} {lastName}</div>
                        <div className="text-sky-100 text-sm">{user?.email}</div>
                        <div className="mt-1 inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold">
                            <Shield size={10} />
                            {roleLabel[user?.role || ""] || user?.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 space-y-5">
                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อ</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                    placeholder="ชื่อ"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">นามสกุล</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                    placeholder="นามสกุล"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">เบอร์โทรศัพท์</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="tel"
                                value={phoneNumber}
                                maxLength={10}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
                                placeholder="0xx-xxx-xxxx"
                            />
                        </div>
                    </div>

                    {/* Read-Only Fields */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">อีเมล</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">บทบาท</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={roleLabel[user?.role || ""] || user?.role || ""}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">เข้าสู่ระบบล่าสุด</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('th-TH') : "-"}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                    </button>
                </div>
            </div>
        </div>
    );
}
