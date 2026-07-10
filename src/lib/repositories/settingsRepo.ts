import 'server-only';
import { col, mapDoc, touch } from '../firebase/firestore';
import { deleteFile } from '../storage/r2';

const COLLECTION = 'settings';
const DOC_ID = 'site';

export type Phone = { label: string; number: string };

export type SiteSettings = {
    contact: {
        phones: Phone[];
        email: string;
        socials: { facebook?: string; instagram?: string; youtube?: string; line?: string; tiktok?: string };
        address?: string;
        mapUrl?: string;
        openingHours?: string;
    };
    donation: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        promptpay?: string;
        qrImage?: string;
        note?: string;
    };
};

const EMPTY: SiteSettings = {
    contact: { phones: [], email: '', socials: {} },
    donation: {},
};

export const settingsRepo = {
    /** Always returns a full object (defaults when the doc doesn't exist yet). */
    async get(): Promise<SiteSettings & Partial<{ _id: string; updatedAt: string }>> {
        const snap = await col(COLLECTION).doc(DOC_ID).get();
        if (!snap.exists) return { ...EMPTY };
        const data = mapDoc<Partial<SiteSettings>>(snap);
        return {
            contact: { ...EMPTY.contact, ...(data.contact ?? {}) },
            donation: { ...EMPTY.donation, ...(data.donation ?? {}) },
            ...data,
        };
    },

    async update(data: SiteSettings) {
        const ref = col(COLLECTION).doc(DOC_ID);

        // If the QR image changed (or was removed), delete the old file from R2
        // so we don't leave orphaned uploads behind.
        const prev = await ref.get();
        const oldQr = prev.exists ? (prev.get('donation.qrImage') as string | undefined) : undefined;
        const newQr = data.donation?.qrImage;
        if (oldQr && oldQr !== newQr) await deleteFile(oldQr);

        await ref.set({ ...data, ...touch() }, { merge: true });
        return mapDoc(await ref.get());
    },
};
