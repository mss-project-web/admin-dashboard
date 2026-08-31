import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { User } from '@/types/user';

export function useUsers(page = 1, limit = 20, search?: string) {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await userService.getUsers(page, limit, search);
            const data = result?.data || [];
            if (Array.isArray(data)) {
                setUsers(data);
                setTotal(result?.total || 0);
                setTotalPages(result?.totalPages || 1);
            } else {
                setUsers([]);
                setTotal(0);
                setTotalPages(1);
                console.warn("API returned non-array for users:", data);
            }
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน");
            setUsers([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        // Adding a small debounce for search if it changes rapidly, though 
        // the caller might handle debounce. Here we just fetch when deps change.
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    return { users, total, totalPages, loading, error, refresh: fetchUsers };
}
