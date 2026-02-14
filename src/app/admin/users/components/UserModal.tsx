import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { Loader2, Edit2, UserPlus, X, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { User, UserRole } from '@/types/user';
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
    const isEditMode = !!userToEdit;
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'admin' as UserRole
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // UI State for Password
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset UI states
            setShowPassword(false);
            setShowConfirmPassword(false);
            setConfirmPassword('');
            setIsChangePasswordMode(false);

            if (userToEdit) {
                // Edit Mode: Pre-fill
                setFormData({
                    email: userToEdit.email || '',
                    password: '', // Password empty by default
                    firstName: userToEdit.firstName || '',
                    lastName: userToEdit.lastName || '',
                    phoneNumber: userToEdit.phoneNumber || '',
                    role: userToEdit.role || 'admin'
                });
            } else {
                // Add Mode: Reset
                setFormData({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                    role: 'admin'
                });
            }
        }
    }, [isOpen, userToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password Validation
        if (!isEditMode || (isEditMode && isChangePasswordMode && formData.password)) {
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
                if (!isChangePasswordMode || !updateData.password) {
                    delete updateData.password;
                }
                await userService.updateUser(userToEdit._id, updateData);
                toastUtils.success("สำเร็จ", "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
            } else {
                await userService.createUser(formData);
                toastUtils.success("สำเร็จ", "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toastUtils.error("เกิดข้อผิดพลาด", err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9990] flex items-center m-0 justify-center bg-black/50 backdrop-blur-sm p-4 animation-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isEditMode ? <Edit2 size={24} className="text-sky-500" /> : <UserPlus size={24} className="text-emerald-500" />}
                        {isEditMode ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                        <X size={20} className="text-slate-500" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อ</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
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
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                placeholder="ใจดี"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">อีเมล</label>
                        <input
                            type="email"
                            required
                            disabled={isEditMode}
                            value={formData.email}
                            onChange={handleEmailChange}
                            className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg  focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans ${isEditMode ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800'}`}
                            placeholder="somchai@example.com"
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Password Section */}
                    <div className="space-y-3 pt-2">
                        {isEditMode && !isChangePasswordMode ? (
                            <button
                                type="button"
                                onClick={() => setIsChangePasswordMode(true)}
                                className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                            >
                                <Lock size={16} />
                                เปลี่ยนรหัสผ่าน
                            </button>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {isEditMode ? 'กำหนดรหัสผ่านใหม่' : 'รหัสผ่าน'}
                                    </label>
                                    {isEditMode && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangePasswordMode(false);
                                                setFormData({ ...formData, password: '' });
                                                setConfirmPassword('');
                                            }}
                                            className="text-xs text-slate-400 hover:text-slate-500"
                                        >
                                            ยกเลิก
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!isEditMode || isChangePasswordMode}
                                            minLength={6}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
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
                                            required={!isEditMode || isChangePasswordMode}
                                            minLength={6}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 transition-all font-sans ${confirmPassword && formData.password !== confirmPassword
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
                                    <div className="text-xs space-y-1 text-slate-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <div className="font-semibold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                                            <AlertCircle size={14} /> คำแนะนำรหัสผ่านที่ปลอดภัย
                                        </div>
                                        <ul className="list-disc list-inside space-y-0.5 ml-1">
                                            <li className={formData.password.length >= 6 ? "text-emerald-600 dark:text-emerald-400 transition-colors" : ""}>
                                                ความยาวอย่างน้อย 6 ตัวอักษร
                                            </li>
                                            <li>ควรใช้ตัวเลขผสมตัวอักษร</li>
                                            <li className={confirmPassword && formData.password === confirmPassword ? "text-emerald-600 dark:text-emerald-400 transition-colors" : ""}>
                                                รหัสผ่านและการยืนยันต้องตรงกัน
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                maxLength={10}
                                onChange={handlePhoneChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-sans"
                                placeholder="0812345678"
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">บทบาท</label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none transition-all cursor-pointer font-sans"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">SuperAdmin</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className={isEditMode ? 'text-white bg-sky-500 hover:bg-sky-600' : 'text-white bg-emerald-500 hover:bg-emerald-600'}
                        >
                            {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                            {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
