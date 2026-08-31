"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { Loader2, Eye, EyeOff, Lock, AlertCircle, ChevronLeft, Save, AlertTriangle, X, KeyRound } from "lucide-react";
import { FormHeader } from "@/app/components/ui/FormHeader";
import { MultiSelect } from "@/app/components/ui/MultiSelect";
import { User, UserRole, Department } from '@/types/user';
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";
import { permissionService } from "@/services/permissionService";
import { useRouter } from 'next/navigation';

interface UserFormProps {
    userToEdit?: User | null;
}

export default function UserForm({ userToEdit }: UserFormProps) {
    const router = useRouter();
    const isEditMode = !!userToEdit;
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [generatingPassword, setGeneratingPassword] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'admin' as UserRole,
        departments: [] as Department[]
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // UI State for Password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            // Edit Mode: Pre-fill
            setFormData({
                email: userToEdit.email || '',
                password: '', // Password empty by default
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                phoneNumber: userToEdit.phoneNumber || '',
                role: userToEdit.role || 'admin',
                departments: userToEdit.departments || []
            });
        }
        
        // Fetch available departments from permissions
        permissionService.getSettings().then(settings => {
            if (settings && settings.departments) {
                setAvailableDepartments(Object.keys(settings.departments));
            }
        }).catch(err => console.error("Failed to load departments", err));

    }, [userToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password Validation for New Users
        if (!isEditMode && formData.password) {
            if (formData.password.length < 6) {
                toastUtils.error("รหัสผ่านสั้นเกินไป", "กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร");
                return;
            }
            if (formData.password !== confirmPassword) {
                toastUtils.error("รหัสผ่านไม่ตรงกัน", "กรุณายืนยันรหัสผ่านให้ถูกต้อง");
                return;
            }
        }

        setLoading(true);

        try {
            if (isEditMode && userToEdit) {
                const updateData: any = { ...formData };
                delete updateData.password; // Never update password from here
                await userService.updateUser(userToEdit._id, updateData);
                toastUtils.success("สำเร็จ", "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
            } else {
                await userService.createUser(formData);
                toastUtils.success("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว");
            }
            router.push('/admin/users');
        } catch (err: any) {
            toastUtils.error("เกิดข้อผิดพลาด", err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
            setLoading(false);
        }
    };

    const handleGeneratePasswordClick = () => {
        if (!userToEdit) return;
        setShowResetConfirm(true);
    };

    const confirmGeneratePassword = async () => {
        if (!userToEdit) return;
        setShowResetConfirm(false);
        setGeneratingPassword(true);
        setTempPassword(null);
        try {
            const res = await userService.resetUserPassword(userToEdit._id);
            setTempPassword(res.tempPassword);
            toastUtils.success("สร้างรหัสผ่านสำเร็จ", "กรุณาคัดลอกรหัสผ่านนี้ส่งให้ผู้ใช้");
        } catch (error: any) {
            toastUtils.error("เกิดข้อผิดพลาด", error?.response?.data?.message || "ไม่สามารถสร้างรหัสผ่านใหม่ได้");
        } finally {
            setGeneratingPassword(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        if (/[^0-9]/.test(input)) {
            setError("กรุณาป้อนเฉพาะตัวเลขเท่านั้น");
        } else {
            setError("");
        }

        const onlyNums = input.replace(/\D/g, '');
        setFormData({ ...formData, phoneNumber: onlyNums });
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, email: value });

        if (/[ก-ี้ใเะาำโูๆแโใ]+/.test(value)) {
            setEmailError("อีเมลต้องเป็นภาษาอังกฤษเท่านั้น");
        }
        else if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError("รูปแบบอีเมลไม่ถูกต้อง (เช่น somchai@example.com)");
        }
        else {
            setEmailError("");
        }
    };

    return (
    <>
            <FormHeader 
                title={isEditMode ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                backUrl="/admin/users"
                formId="user-form"
                isLoading={loading}
                saveLabel={isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้'}
            />

            <form id="user-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 w-full max-w-full">
                {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
                {/* Card 1: ข้อมูลส่วนตัว */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="w-1.5 h-5 bg-sky-500 rounded-full"></span>
                        ข้อมูลส่วนตัว
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อ</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                placeholder="สมชาย"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">นามสกุล</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                placeholder="ใจดี"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">อีเมล</label>
                            <input
                                type="email"
                                required
                                disabled={isEditMode}
                                value={formData.email}
                                onChange={handleEmailChange}
                                className={`w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans ${isEditMode ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800'}`}
                                placeholder="somchai@example.com"
                            />
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {emailError}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                maxLength={10}
                                onChange={handlePhoneChange}
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                placeholder="0812345678"
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
                <div className="space-y-6">
                    {/* Card 2: สิทธิ์การใช้งานและความปลอดภัย */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
                            ความปลอดภัย
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">บทบาทผู้ใช้งาน</label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none transition-all cursor-pointer font-sans"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">SuperAdmin</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">สังกัดฝ่าย</label>
                            <MultiSelect 
                                options={availableDepartments}
                                value={formData.departments}
                                onChange={(value) => setFormData(prev => ({ ...prev, departments: value as Department[] }))}
                                placeholder="เลือกสังกัดฝ่าย..."
                            />
                        </div>

                        {/* Password Section (Edit Mode - Generate Temp Password) */}
                        {isEditMode && (
                            <div className="pt-2 mt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 mt-4">
                                    การจัดการรหัสผ่าน
                                </label>
                                {tempPassword ? (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">รหัสผ่านชั่วคราวของคุณคือ</span>
                                        <code className="text-2xl font-black text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950 px-4 py-2 rounded-lg shadow-sm">
                                            {tempPassword}
                                        </code>
                                        <p className="text-[10px] text-orange-500 text-center mt-2">กรุณาคัดลอกและส่งให้ผู้ใช้ทันที ผู้ใช้จะสามารถนำไปล็อกอินและระบบอาจจะให้เปลี่ยนใหม่ (ถ้าตั้งค่าไว้)</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                            หากผู้ใช้งานลืมรหัสผ่าน แอดมินสามารถสร้างรหัสผ่านชั่วคราวใหม่ให้ได้
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGeneratePasswordClick}
                                            disabled={generatingPassword}
                                            className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {generatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                            {generatingPassword ? "กำลังสร้าง..." : "สร้างรหัสผ่านชั่วคราว"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password Section (Only for Create) */}
                        {!isEditMode && (
                            <div className="pt-2 mt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            รหัสผ่านเริ่มต้น
                                        </label>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required={!isEditMode}
                                                minLength={6}
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-3 py-2.5 pr-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        <div className="relative group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required={!isEditMode}
                                                minLength={6}
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className={`w-full px-3 py-2.5 pr-10 border rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 transition-all font-sans ${confirmPassword && formData.password !== confirmPassword
                                                    ? 'border-rose-200 focus:ring-rose-500'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-sky-500'
                                                    }`}
                                                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {/* Password Guidance */}
                                        <div className="text-xs space-y-1 text-slate-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                                                <AlertCircle size={14} /> คำแนะนำรหัสผ่าน
                                            </div>
                                            <ul className="list-disc list-inside space-y-0.5 ml-1">
                                                <li className={formData.password.length >= 6 ? "text-emerald-600 dark:text-emerald-400 transition-colors" : ""}>
                                                    ความยาวอย่างน้อย 6 ตัวอักษร
                                                </li>
                                                <li className={confirmPassword && formData.password === confirmPassword ? "text-emerald-600 dark:text-emerald-400 transition-colors" : ""}>
                                                    รหัสผ่านและการยืนยันต้องตรงกัน
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </form>

            {/* Custom Modal for Reset Password Confirmation */}
            {showResetConfirm && userToEdit && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="text-rose-500" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                ยืนยันสร้างรหัสผ่านชั่วคราว
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                คุณต้องการสร้างรหัสผ่านชั่วคราวให้ <strong>{userToEdit.firstName}</strong> หรือไม่? ระบบจะบังคับให้ผู้ใช้งานออกจากระบบทันที
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={confirmGeneratePassword}
                                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <KeyRound size={16} />
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
