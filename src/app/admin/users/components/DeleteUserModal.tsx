import { useState } from 'react';
import { userService } from '@/services/userService';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { toastUtils } from "@/lib/toast";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Verify credentials of the CURRENT admin
            if (!user?.email) {
                throw new Error("Cannot verify current user");
            }

            await authApi.login({ email: user.email, password });

            // 2. If login success, proceed to delete
            await userService.deleteUser(userIdToDelete);

            toastUtils.success("สำเร็จ", `ลบผู้ใช้ "${userNameToDelete}" เรียบร้อยแล้ว`);

            onSuccess();
            onClose();
            setPassword('');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                toastUtils.error("เกิดข้อผิดพลาด", "รหัสผ่านไม่ถูกต้อง");
            } else {
                toastUtils.error("เกิดข้อผิดพลาด", err.response?.data?.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animation-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold">ยืนยันการลบผู้ใช้</h3>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        การกระทำนี้ไม่สามารถย้อนกลับได้ กรุณากรอกรหัสผ่านของคุณเพื่อยืนยันว่าคุณต้องการลบผู้ใช้ <span className="font-bold text-slate-800 dark:text-white">"{userNameToDelete}"</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รหัสผ่านของคุณ (Admin Password)</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
                                placeholder="********"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={loading || !password}
                                className="text-white bg-red-500 hover:bg-red-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                                ยืนยันการลบ
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
