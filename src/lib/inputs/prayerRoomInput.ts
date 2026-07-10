import 'server-only';
import { uploadFile } from '../storage/r2';
import type { PrayerRoomFields } from '../repositories/prayerRoomRepo';

export type ParsedPrayerRoom = {
    fields: PrayerRoomFields;
    newImages: string[];
    deleteImages: string[];
};

function maybeJson<T>(v: unknown): T | undefined {
    if (v === undefined || v === null || v === '') return undefined;
    if (typeof v === 'string') {
        try {
            return JSON.parse(v) as T;
        } catch {
            return v as unknown as T;
        }
    }
    return v as T;
}

function parseDeleteImages(v: unknown): string[] {
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === 'string') {
        try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed : [v];
        } catch {
            return [v];
        }
    }
    return [];
}

function build(raw: Record<string, unknown>): Omit<ParsedPrayerRoom, 'newImages'> {
    const fields: PrayerRoomFields = {
        name: raw.name as string | undefined,
        place: raw.place as string | undefined,
        detail: raw.detail as string | undefined,
        faculty: raw.faculty as string | undefined,
        location: maybeJson<number[]>(raw.location),
        openingHours: raw.openingHours as string | undefined,
        youtube_url: raw.youtube_url as string | undefined,
        capacity: raw.capacity !== undefined && raw.capacity !== '' ? Number(raw.capacity) : undefined,
        google_map_url: raw.google_map_url as string | undefined,
        facilities: maybeJson<string[]>(raw.facilities),
        phone: raw.phone as string | undefined,
    };
    return { fields, deleteImages: parseDeleteImages(raw.delete_images) };
}

export async function parsePrayerRoom(req: Request): Promise<ParsedPrayerRoom> {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const form = await req.formData();
        const raw: Record<string, unknown> = {};
        for (const [key, value] of form.entries()) {
            if (key === 'images') continue;
            if (key === 'delete_images') {
                const all = form.getAll('delete_images').map((v) => v.toString());
                raw.delete_images = all.length > 1 ? all : all[0];
                continue;
            }
            raw[key] = value.toString();
        }
        const files = form.getAll('images').filter((f): f is File => f instanceof File);
        const newImages: string[] = [];
        for (const file of files) newImages.push(await uploadFile(file));
        return { ...build(raw), newImages };
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return { ...build(body), newImages: [] };
}
