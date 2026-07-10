import 'server-only';
import { col, mapDoc, mapQuery, timestamps, touch, FieldValue } from '../firebase/firestore';
import { getAdminAuth } from '../firebase/admin';
import { BadRequest, NotFound } from '../http/response';
import { signInWithPassword, setRoleClaim } from '../auth/firebase';

const COLLECTION = 'accounts';

export type AccountRole = 'user' | 'admin' | 'superadmin';

export type CreateAccount = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: AccountRole;
    createdBy?: string;
};

export type UpdateAccount = Partial<Omit<CreateAccount, 'password'>> & { password?: string };

type AccountProfile = {
    email: string;
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
            createdBy: dto.createdBy ?? null,
            lastLoginAt: null,
            deletedAt: null,
            deletedBy: null,
            ...timestamps(),
        });
        return mapDoc(await ref.get());
    },

    async findAll() {
        return mapQuery(col(COLLECTION).where('deletedAt', '==', null));
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

    async countAll() {
        return (await col(COLLECTION).where('deletedAt', '==', null).count().get()).data().count;
    },
};
