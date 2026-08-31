"use server";

import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/firebase";
import { accountRepo } from "@/lib/repositories/accountRepo";
import { User } from "@/types/user";

/** Current user from the Firebase session cookie (server components/actions). */
export async function getSession(): Promise<User | null> {
    const cookie = await getSessionCookie();
    if (!cookie) return null;

    try {
        const { uid, role, email } = await verifySession(cookie);

        let firstName = "Admin";
        let lastName = "";
        let phoneNumber = "";
        let mustChangePassword = false;
        let departments: string[] = [];
        try {
            const acc = (await accountRepo.findOne(uid)) as unknown as Partial<User>;
            firstName = acc.firstName ?? firstName;
            lastName = acc.lastName ?? lastName;
            phoneNumber = acc.phoneNumber ?? phoneNumber;
            mustChangePassword = acc.mustChangePassword ?? false;
            departments = acc.departments ?? [];
        } catch {
            /* profile doc missing — fall back to token claims */
        }

        return {
            _id: uid,
            role,
            email: email || "",
            firstName,
            lastName,
            phoneNumber,
            mustChangePassword,
            departments,
        } as User;
    } catch {
        return null;
    }
}
