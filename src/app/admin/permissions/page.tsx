"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Shield, Save, Loader2, Info, Plus } from "lucide-react";
import { permissionService, PermissionSettings } from "@/services/permissionService";
import { toastUtils } from "@/lib/toast";

const ALL_MENUS = [
    { id: "/admin", label: "ภาพรวม (Dashboard)" },
    { id: "/admin/blog/content", label: "จัดการเนื้อหาบทความ" },
    { id: "/admin/activity", label: "จัดการกิจกรรม" },
    { id: "/admin/activity/calendar", label: "ปฏิทินกิจกรรม" },
    { id: "/admin/prayer-rooms", label: "จัดการห้องละหมาด" },
    { id: "/admin/news", label: "จัดการข่าวสาร" },
    { id: "/admin/settings", label: "ติดต่อ & บริจาค" },
    { id: "/admin/users", label: "รายชื่อผู้ใช้งาน" },
    { id: "/admin/permissions", label: "จัดการสิทธิ์" },
];

export default function PermissionsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<PermissionSettings>({ departments: {} });
    const [newDeptName, setNewDeptName] = useState("");
    const [isAddingDept, setIsAddingDept] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current permission settings
                const perms = await permissionService.getSettings();
                
                // Get all departments from settings
                const depts = Object.keys(perms.departments || {}).sort();
                
                setDepartments(depts);
                setPermissions(perms);
            } catch (error) {
                toastUtils.error("โหลดข้อมูลสิทธิ์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const togglePermission = (department: string, menuId: string) => {
        setPermissions(prev => {
            const currentDeptPerms = prev.departments[department] || [];
            const isGranted = currentDeptPerms.includes(menuId);
            
            const newDeptPerms = isGranted
                ? currentDeptPerms.filter(id => id !== menuId)
                : [...currentDeptPerms, menuId];
                
            return {
                ...prev,
                departments: {
                    ...prev.departments,
                    [department]: newDeptPerms
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await permissionService.updateSettings(permissions);
            toastUtils.success("บันทึกสิทธิ์การเข้าถึงสำเร็จ", "อัปเดตสิทธิ์เรียบร้อยแล้ว");
        } catch (error) {
            toastUtils.error("เกิดข้อผิดพลาดในการบันทึก", "กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSaving(false);
        }
    };

    const handleAddDepartment = () => {
        const name = newDeptName.trim();
        if (!name) return;
        if (departments.includes(name)) {
            toastUtils.error("มีฝ่ายนี้อยู่ในระบบแล้ว", "กรุณาใช้ชื่อฝ่ายอื่น");
            return;
        }

        setPermissions(prev => ({
            ...prev,
            departments: {
                ...prev.departments,
                [name]: []
            }
        }));
        setDepartments(prev => [...prev, name].sort());
        setNewDeptName("");
        setIsAddingDept(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 size={40} className="animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <PageHeader 
                        title="จัดการสิทธิ์ตามฝ่าย" 
                        icon={Shield}
                        colorClass="bg-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-1">กำหนดสิทธิ์การเข้าถึงเมนูต่างๆ ให้กับแต่ละฝ่ายในระบบ</p>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddingDept(true)}
                        disabled={saving || isAddingDept}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <Plus size={18} />
                        เพิ่มฝ่ายใหม่
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        บันทึกการตั้งค่า
                    </button>
                </div>
            </div>

            {isAddingDept && (
                <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900/50 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        placeholder="พิมพ์ชื่อฝ่ายใหม่ (เช่น ไอที, การเงิน)"
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddDepartment();
                            if (e.key === 'Escape') setIsAddingDept(false);
                        }}
                    />
                    <button onClick={handleAddDepartment} className="px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600">
                        ยืนยัน
                    </button>
                    <button onClick={() => setIsAddingDept(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        ยกเลิก
                    </button>
                </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex gap-3 text-sm text-blue-700 dark:text-blue-300">
                <Info size={20} className="shrink-0" />
                <div>
                    <p className="font-bold mb-1">คำแนะนำการใช้งาน</p>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>Super Admin จะสามารถเข้าถึงได้ <b>ทุกหน้าจอ</b> เสมอ โดยไม่ต้องพึ่งพาสิทธิ์ตามฝ่าย</li>
                        <li>ตารางด้านล่างแสดงเฉพาะฝ่ายที่มีผู้ใช้งานสังกัดอยู่ หากเพิ่มฝ่ายใหม่ให้ผู้ใช้งาน ฝ่ายนั้นจะปรากฏขึ้นมาที่นี่อัตโนมัติ</li>
                        <li>หากผู้ใช้ทั่วไป (`admin` หรือ `user`) ไม่มีสังกัดฝ่ายใดเลย พวกเขาจะไม่เห็นเมนูใดๆ นอกจากต้องให้สิทธิ์ไว้</li>
                        <li>ผู้ใช้ที่อยู่ 2 ฝ่ายขึ้นไป จะเห็นเมนูรวมกันของทั้ง 2 ฝ่าย</li>
                    </ul>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 min-w-[200px] border-r border-slate-100 dark:border-slate-800/50">
                                    เมนูหน้าจอ
                                </th>
                                {departments.length === 0 ? (
                                    <th className="px-6 py-4 text-center font-bold text-slate-400 italic">ยังไม่มีฝ่ายในระบบ</th>
                                ) : (
                                    departments.map(dept => (
                                        <th key={dept} className="px-4 py-4 text-center">
                                            <div className="inline-flex px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold rounded-lg whitespace-nowrap text-sm border border-blue-100 dark:border-blue-800/30">
                                                ฝ่าย {dept}
                                            </div>
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {ALL_MENUS.map((menu, idx) => (
                                <tr key={menu.id} className={`hover:bg-sky-50/50 dark:hover:bg-slate-800/30 transition-colors group ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}>
                                    <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800/50">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {menu.label}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mt-1 ml-3.5">{menu.id}</div>
                                    </td>
                                    {departments.length === 0 ? (
                                        <td className="px-6 py-4 text-center text-slate-300">-</td>
                                    ) : (
                                        departments.map(dept => {
                                            const isGranted = (permissions.departments[dept] || []).includes(menu.id);
                                            return (
                                                <td key={dept} className="px-4 py-4 text-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isGranted}
                                                            onChange={() => togglePermission(dept, menu.id)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500 shadow-sm"></div>
                                                    </label>
                                                </td>
                                            );
                                        })
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
