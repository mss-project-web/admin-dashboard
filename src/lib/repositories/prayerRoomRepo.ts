import 'server-only';
import { col, mapDoc, mapQuery, timestamps, touch, FieldValue } from '../firebase/firestore';
import { NotFound } from '../http/response';
import { deleteFile } from '../storage/r2';

const COLLECTION = 'prayerRooms';

export type PrayerRoomFields = {
    name?: string;
    place?: string;
    detail?: string;
    faculty?: string;
    location?: number[];
    openingHours?: string;
    youtube_url?: string;
    capacity?: number;
    google_map_url?: string;
    facilities?: string[];
    phone?: string;
};

export const prayerRoomRepo = {
    async create(fields: PrayerRoomFields, images: string[]) {
        const ref = await col(COLLECTION).add({
            name: fields.name,
            place: fields.place,
            detail: fields.detail,
            faculty: fields.faculty,
            location: fields.location ?? [],
            openingHours: fields.openingHours,
            youtube_url: fields.youtube_url,
            capacity: fields.capacity,
            google_map_url: fields.google_map_url,
            facilities: fields.facilities ?? [],
            phone: fields.phone,
            images,
            views: 0,
            ...timestamps(),
        });
        return mapDoc(await ref.get());
    },

    async findAll() {
        return mapQuery(col(COLLECTION));
    },

    async findOne(id: string, incrementView = false) {
        const ref = col(COLLECTION).doc(id);
        if (incrementView) await ref.update({ views: FieldValue.increment(1) }).catch(() => undefined);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound('Prayer room not found');
        return mapDoc(snap);
    },

    async update(id: string, fields: PrayerRoomFields, newImages: string[] = [], deleteImages: string[] = []) {
        const ref = col(COLLECTION).doc(id);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound('Prayer room not found');
        const current = mapDoc<{ images?: string[] }>(snap);

        let images = current.images ?? [];
        if (deleteImages.length) {
            for (const url of deleteImages) await deleteFile(url);
            images = images.filter((img) => !deleteImages.includes(img));
        }
        if (newImages.length) images = [...images, ...newImages];

        const patch: Record<string, unknown> = { images, ...touch() };
        const keys: (keyof PrayerRoomFields)[] = [
            'name', 'place', 'detail', 'faculty', 'location', 'openingHours',
            'youtube_url', 'capacity', 'google_map_url', 'facilities', 'phone',
        ];
        for (const k of keys) if (fields[k] !== undefined) patch[k] = fields[k];

        await ref.update(patch);
        return mapDoc(await ref.get());
    },

    async remove(id: string) {
        const ref = col(COLLECTION).doc(id);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound('Prayer room not found');
        const current = mapDoc<{ images?: string[] }>(snap);
        for (const url of current.images ?? []) await deleteFile(url);
        await ref.delete();
    },

    async countAll() {
        return (await col(COLLECTION).count().get()).data().count;
    },
};
