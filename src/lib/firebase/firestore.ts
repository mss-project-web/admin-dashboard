import 'server-only';
import { Timestamp, FieldValue, type DocumentSnapshot, type Query } from 'firebase-admin/firestore';
import { getDb } from './admin';

/**
 * Shared Firestore helpers so each module repository stays thin.
 * Documents are mapped back to the shape the frontend already expects:
 *  - `_id` and `id` both carry the Firestore document id (Mongo compatibility)
 *  - Firestore Timestamp fields are serialised to ISO strings (as JSON did before)
 */

/** Recursively convert Timestamps to ISO strings for JSON responses. */
function serialise(value: unknown): unknown {
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (Array.isArray(value)) return value.map(serialise);
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = serialise(v);
        return out;
    }
    return value;
}

export function mapDoc<T = Record<string, unknown>>(snap: DocumentSnapshot): T & { _id: string; id: string } {
    const data = (snap.data() ?? {}) as Record<string, unknown>;
    return { ...(serialise(data) as T), _id: snap.id, id: snap.id };
}

export async function mapQuery<T = Record<string, unknown>>(query: Query): Promise<(T & { _id: string; id: string })[]> {
    const snap = await query.get();
    return snap.docs.map((d) => mapDoc<T>(d));
}

export const col = (name: string) => getDb().collection(name);

/** Server-side createdAt/updatedAt, mirroring Mongoose `{ timestamps: true }`. */
export const timestamps = () => ({
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
});

export const touch = () => ({ updatedAt: FieldValue.serverTimestamp() });

export { getDb, Timestamp, FieldValue };
