import 'server-only';
import { col, mapDoc, mapQuery, timestamps, touch, Timestamp, FieldValue } from '../firebase/firestore';
import { getAdminAuth } from '../firebase/admin';
import { BadRequest, NotFound } from '../http/response';
import { signInWithPassword, setRoleClaim } from '../auth/firebase';

const COLLECTION = 'accounts';

export type AccountRole = 'user' | 'admin' | 'superadmin';
export type Department = string;

export type CreateAccount = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: AccountRole;
    createdBy?: string;
    mustChangePassword?: boolean;
    departments?: Department[];
};

export type UpdateAccount = Partial<Omit<CreateAccount, 'password'>> & { password?: string; mustChangePassword?: boolean; departments?: Department[] };

type AccountProfile = {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: AccountRole;
    deletedAt: string | null;
    [k: string]: unknown;
};

/**
 * Accounts are backed by Firebase Authentication (identity + password) with a
 * Firestore profile document keyed by the Auth uid. Roles live in a custom
 * claim (for auth) mirrored into the profile (for listing/filtering).
 */
export const accountRepo = {
    async findByEmail(email: string) {
        const snap = await col(COLLECTION).where('email', '==', email.toLowerCase().trim()).limit(1).get();
        return snap.empty ? null : mapDoc<AccountProfile>(snap.docs[0]);
    },

    async create(dto: CreateAccount) {
        const email = dto.email.toLowerCase().trim();
        if (await this.findByEmail(email)) throw BadRequest('Email already in use');

        const role: AccountRole = dto.role ?? 'user';
        const userRecord = await getAdminAuth().createUser({
            email,
            password: dto.password,
            displayName: `${dto.firstName} ${dto.lastName}`.trim(),
        });
        await setRoleClaim(userRecord.uid, role);

        const ref = col(COLLECTION).doc(userRecord.uid); // doc id == Auth uid
        await ref.set({
            email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phoneNumber: dto.phoneNumber ?? null,
            role,
            departments: dto.departments ?? [],
            createdBy: dto.createdBy ?? null,
            mustChangePassword: dto.mustChangePassword ?? false,
            lastLoginAt: null,
            deletedAt: null,
            deletedBy: null,
            ...timestamps(),
        });
        return mapDoc(await ref.get());
    },

    async findPaginated(search?: string, page = 1, limit = 20) {
        const q = col(COLLECTION)
            .where('deletedAt', '==', null)
            .orderBy('createdAt', 'desc');

        if (search) {
            const s = search.toLowerCase();
            const snap = await q.get();
            const all = snap.docs.map(d => mapDoc<AccountProfile>(d));
            const filtered = all.filter(u => 
                u.email?.toLowerCase().includes(s) ||
                u.firstName?.toLowerCase().includes(s) ||
                u.lastName?.toLowerCase().includes(s) ||
                u.phoneNumber?.includes(s)
            );
            const total = filtered.length;
            const start = (page - 1) * limit;
            const data = filtered.slice(start, start + limit);
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }

        const countSnap = await col(COLLECTION).where('deletedAt', '==', null).count().get();
        const total = countSnap.data().count;

        const snap = await q.offset((page - 1) * limit).limit(limit).get();
        const data = snap.docs.map(d => mapDoc<AccountProfile>(d));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    },

    async findAll() {
        return mapQuery(col(COLLECTION)
            .where('deletedAt', '==', null)
            .orderBy('createdAt', 'desc')
            .limit(500));
    },

    async findOne(uid: string) {
        const snap = await col(COLLECTION).doc(uid).get();
        const acc = snap.exists ? mapDoc<AccountProfile>(snap) : null;
        if (!acc || acc.deletedAt) throw NotFound('Account not found');
        return acc;
    },

    async update(uid: string, dto: UpdateAccount) {
        const ref = col(COLLECTION).doc(uid);
        const snap = await ref.get();
        const acc = snap.exists ? mapDoc<AccountProfile>(snap) : null;
        if (!acc || acc.deletedAt) throw NotFound('Account not found or deleted');

        // Mirror email/password changes into Firebase Auth.
        const authPatch: { email?: string; password?: string } = {};
        if (dto.email) authPatch.email = dto.email.toLowerCase().trim();
        if (dto.password) authPatch.password = dto.password;
        if (Object.keys(authPatch).length) await getAdminAuth().updateUser(uid, authPatch);

        const patch: Record<string, unknown> = { ...touch() };
        if (dto.email) patch.email = dto.email.toLowerCase().trim();
        if (dto.firstName !== undefined) patch.firstName = dto.firstName;
        if (dto.lastName !== undefined) patch.lastName = dto.lastName;
        if (dto.phoneNumber !== undefined) patch.phoneNumber = dto.phoneNumber;
        if (dto.mustChangePassword !== undefined) patch.mustChangePassword = dto.mustChangePassword;
        if (dto.departments !== undefined) patch.departments = dto.departments;
        await ref.update(patch);
        return mapDoc(await ref.get());
    },

    async updateRole(uid: string, role: AccountRole) {
        const ref = col(COLLECTION).doc(uid);
        if (!(await ref.get()).exists) throw NotFound('Account not found');
        await setRoleClaim(uid, role);
        await ref.update({ role, ...touch() });
        return mapDoc(await ref.get());
    },

    async softDelete(uid: string, deletedBy: string) {
        const activeCount = (await col(COLLECTION).where('deletedAt', '==', null).count().get()).data().count;
        if (activeCount <= 1) throw BadRequest('Cannot delete the last active account on the system');

        const ref = col(COLLECTION).doc(uid);
        if (!(await ref.get()).exists) throw NotFound('Account not found');
        await getAdminAuth().updateUser(uid, { disabled: true });
        await getAdminAuth().revokeRefreshTokens(uid);
        await ref.update({ deletedAt: FieldValue.serverTimestamp(), deletedBy, ...touch() });
        return mapDoc(await ref.get());
    },

    /** Verify a user's own password (for self-service delete) via Firebase sign-in. */
    async verifyPassword(uid: string, password: string) {
        const acc = await this.findOne(uid);
        try {
            await signInWithPassword(acc.email, password);
            return true;
        } catch {
            return false;
        }
    },

    async updateLastLogin(uid: string) {
        await col(COLLECTION).doc(uid).update({ lastLoginAt: FieldValue.serverTimestamp() }).catch(() => undefined);
    },

    async countAll(startDate?: string, endDate?: string) {
        let query: any = col(COLLECTION).where('deletedAt', '==', null);
        if (startDate) query = query.where('createdAt', '>=', Timestamp.fromDate(new Date(startDate)));
        if (endDate) query = query.where('createdAt', '<=', Timestamp.fromDate(new Date(endDate)));
        return (await query.count().get()).data().count;
    },
};
