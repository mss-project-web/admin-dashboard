import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { User } from '@/types/user';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getUsers();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
                console.warn("API returned non-array for users:", data);
            }
        } catch (err: any) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน");
            setUsers([]); // Clear users on error to avoid stale data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refresh: fetchUsers };
}
