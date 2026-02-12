import { useState } from 'react';
import { userService } from '@/services/userService';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userIdToDelete: string;
    userNameToDelete: string;
}

export default function DeleteUserModal({ isOpen, onClose, onSuccess, userIdToDelete, userNameToDelete }: DeleteUserModalProps) {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Verify credentials of the CURRENT admin
            if (!user?.email) {
                throw new Error("Cannot verify current user");
            }

            await authApi.login({ email: user.email, password });

            // 2. If login success, proceed to delete
            await userService.deleteUser(userIdToDelete);

            onSuccess();
            onClose();
            setPassword('');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("รหัสผ่านไม่ถูกต้อง");
            } else {
                setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
                <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle size={20} /> ยืนยันการลบผู้ใช้
                    </h3>
                    <button onClick={onClose} className="cursor-pointer text-red-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                        คุณกำลังจะลบผู้ใช้ <span className="font-bold text-slate-800 dark:text-white">"{userNameToDelete}"</span>
                        <br />
                        การกระทำนี้ไม่สามารถย้อนกลับได้ กรุณากรอกรหัสผ่านของคุณเพื่อยืนยัน
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รหัสผ่านของคุณ (Admin Password)</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="********"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100 flex items-center gap-1">
                                <AlertTriangle size={12} /> {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                ยืนยันลบ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
