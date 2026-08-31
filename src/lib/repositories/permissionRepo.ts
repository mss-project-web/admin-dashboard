import { getDb } from '@/lib/firebase/admin';

export interface DepartmentPermissions {
    [departmentName: string]: string[]; // array of allowed hrefs (menu links)
}

export interface PermissionSettings {
    departments: DepartmentPermissions;
}

const COLLECTION = 'settings';
const DOC_ID = 'permissions';

export const permissionRepo = {
    async getSettings(): Promise<PermissionSettings> {
        const db = getDb();
        const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
        if (!doc.exists) {
            return { departments: {} };
        }
        return doc.data() as PermissionSettings;
    },

    async updateSettings(settings: PermissionSettings): Promise<void> {
        const db = getDb();
        await db.collection(COLLECTION).doc(DOC_ID).set(settings, { merge: true });
    }
};
