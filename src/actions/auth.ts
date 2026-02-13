"use server";

import { cookies } from "next/headers";
import { User, UserRole } from "@/types/user";

function parseJwtServer(token: string) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        const jsonPayload = buffer.toString('utf-8');

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

//test

export async function getSession(): Promise<User | null> {
    const cookieStore = await cookies();
    
    const tokenCookie = cookieStore.get("access_token") || cookieStore.get("token") || cookieStore.get("jwt");
    
    let token = tokenCookie?.value;

    if (!token) {
        const allCookies = cookieStore.getAll();
        for (const c of allCookies) {
            if (c.value && c.value.split('.').length === 3) {
                token = c.value;
                break;
            }
        }
    }

    if (token) {
        const payload = parseJwtServer(token);
        if (payload) {
             const userId = payload.sub || payload._id || payload.id;
             const userRole = payload.role as UserRole;

             if (userId && userRole) {
                 return {
                     _id: userId,
                     role: userRole,
                     firstName: 'Admin',
                     lastName: '',
                     email: payload.email || '',
                     phoneNumber: ''
                 } as User;
             }
        }
    }

    return null;
}
