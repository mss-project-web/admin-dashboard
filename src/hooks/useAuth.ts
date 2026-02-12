import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { parseJwt } from '@/lib/authUtils'; // No longer needed for cookie reading
import { getSession } from '@/actions/auth';
import { userService } from '@/services/userService';
import { User } from '@/types/user';

export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
             try {
                // 1. Use Server Action to read HttpOnly cookies & get basic session info
                const sessionUser = await getSession();
                
                if (sessionUser) {
                    // 2. If valid session, fetch full profile from /accounts/me
                    // This ensures we have the latest firstName, lastName, etc. to display
                    try {
                        const fullUser = await userService.getMe();
                        setUser(fullUser);
                    } catch (err) {
                        console.warn("Failed to fetch full user profile, using session data:", err);
                         // Fallback to session data (which might have placeholder names but correct ID/Role)
                        setUser(sessionUser); 
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return { 
        user, 
        loading, 
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin' 
    };
}
