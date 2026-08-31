'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession } from '@/actions/auth';
import { userService } from '@/services/userService';
import { User } from '@/types/user';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    isSuperAdmin: false,
});

export function AuthProvider({ children, initialUser }: { children: ReactNode, initialUser: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(false); // No longer loading since we get it from SSR

    // If initialUser changes (e.g. user logs out and Next.js re-renders layout), sync the state
    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'superadmin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}
