import 'server-only';
import { col, mapDoc, mapQuery, timestamps, touch, Timestamp, FieldValue } from '../firebase/firestore';
import { NotFound } from '../http/response';
import { deleteFile } from '../storage/r2';

const COLLECTION = 'news';

export type NewsFields = {
    name?: string;
    date?: Date;
    link?: string;
    description?: string;
};

export const newsRepo = {
    async create(fields: NewsFields, images: string[]) {
        const ref = await col(COLLECTION).add({
            name: fields.name,
            date: fields.date ? Timestamp.fromDate(fields.date) : null,
            link: fields.link ?? '',
            description: fields.description ?? '',
            images,
            views: 0,
            ...timestamps(),
        });
        return mapDoc(await ref.get());
    },

    async findAll() {
        return mapQuery(col(COLLECTION).orderBy('createdAt', 'desc'));
    },

    async getByDateRange(start: Date, end: Date) {
        return mapQuery(
            col(COLLECTION)
                .where('date', '>=', Timestamp.fromDate(start))
                .where('date', '<=', Timestamp.fromDate(end))
                .orderBy('date', 'asc'),
        );
    },

    async getNewsInCurrentMonth() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return this.getByDateRange(start, end);
    },

    async getNewsByMonthAndYear(month: number, year: number) {
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        return this.getByDateRange(start, end);
    },

    async getLatest(limit = 3) {
        return mapQuery(col(COLLECTION).orderBy('date', 'desc').limit(limit));
    },

    async getMostViewed(limit = 5) {
        return mapQuery(col(COLLECTION).orderBy('views', 'desc').limit(limit));
    },

    async findOne(id: string, incrementView = false) {
        const ref = col(COLLECTION).doc(id);
        if (incrementView) await ref.update({ views: FieldValue.increment(1) }).catch(() => undefined);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound(`News with id '${id}' not found`);
        return mapDoc(snap);
    },

    async update(id: string, fields: NewsFields, newImages: string[] = [], deleteImages: string[] = []) {
        const ref = col(COLLECTION).doc(id);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound(`News with id '${id}' not found`);
        const current = mapDoc<{ images?: string[] }>(snap);

        let images = current.images ?? [];
        if (deleteImages.length) {
            for (const url of deleteImages) await deleteFile(url);
            images = images.filter((img) => !deleteImages.includes(img));
        }
        if (newImages.length) images = [...images, ...newImages];

        const patch: Record<string, unknown> = { images, ...touch() };
        if (fields.name !== undefined) patch.name = fields.name;
        if (fields.date !== undefined) patch.date = Timestamp.fromDate(fields.date);
        if (fields.link !== undefined) patch.link = fields.link;
        if (fields.description !== undefined) patch.description = fields.description;

        await ref.update(patch);
        return mapDoc(await ref.get());
    },

    async remove(id: string) {
        const ref = col(COLLECTION).doc(id);
        const snap = await ref.get();
        if (!snap.exists) throw NotFound(`News with id '${id}' not found`);
        const current = mapDoc<{ images?: string[] }>(snap);
        for (const url of current.images ?? []) await deleteFile(url);
        await ref.delete();
    },

    async countAll() {
        return (await col(COLLECTION).count().get()).data().count;
    },
};
