import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { X, Save, Loader2, Edit2, UserPlus } from 'lucide-react';
import { User, UserRole } from '@/types/user';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
    const isEditMode = !!userToEdit;

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'admin' as UserRole
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
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
            setError('');
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isEditMode && userToEdit) {
                // Update
                const updateData: any = { ...formData };
                if (!updateData.password) delete updateData.password; // Don't send empty password

                // Usually email shouldn't be changed if it's the ID, but depends on backend. 
                // Front-end disables email input in edit mode below.

                await userService.updateUser(userToEdit._id, updateData);
            } else {
                // Create
                await userService.createUser(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animation-fade-in-up">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {isEditMode ? <Edit2 size={20} className="text-sky-500" /> : <UserPlus size={20} className="text-emerald-500" />}
                        {isEditMode ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                    </h3>
                    <button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
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
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
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
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
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
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg  focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${isEditMode ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed' : 'bg-slate-50 dark:bg-slate-800'}`}
                            placeholder="somchai@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {isEditMode ? 'รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน'}
                        </label>
                        <input
                            type="password"
                            required={!isEditMode}
                            minLength={6}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                            placeholder={isEditMode ? "••••••••" : "กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                placeholder="0812345678"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">บทบาท</label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none transition-all cursor-pointer"
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

                    {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100"><span className=" font-bold">Error:</span> {error}</div>}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`cursor-pointer flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 ${isEditMode ? 'bg-sky-500 hover:bg-sky-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : isEditMode ? <Save size={16} /> : <UserPlus size={16} />}
                            {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
