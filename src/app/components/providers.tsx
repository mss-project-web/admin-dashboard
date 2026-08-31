'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { User } from '@/types/user'

export function Providers({ children, initialUser }: { children: React.ReactNode, initialUser: User | null }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider initialUser={initialUser}>
                {children}
            </AuthProvider>
        </ThemeProvider>
    )
}
