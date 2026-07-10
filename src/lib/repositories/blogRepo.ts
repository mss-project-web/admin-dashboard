import 'server-only';
import { col, mapDoc, timestamps, touch, FieldValue } from '../firebase/firestore';
import { NotFound } from '../http/response';

const COLLECTION = 'blogs';

type ContentBlock = { type: string; data: unknown };

export type CreateBlog = {
    title: string;
    description?: string;
    content: ContentBlock[];
    tags?: string[];
    author?: string;
    group: string;
    slug?: string;
    status?: 'draft' | 'published';
    coverImage?: string;
};

export type UpdateBlog = Partial<CreateBlog>;

type BlogRaw = {
    title: string;
    description?: string;
    slug: string;
    status: string;
    views?: number;
    createdAt?: string;
    [k: string]: unknown;
};

const PREVIEW_FIELDS = ['title', 'description', 'tags', 'createdAt', 'author', 'group', 'coverImage', 'slug', 'views'] as const;

function pick<T extends Record<string, unknown>>(obj: T, keys: readonly string[]) {
    const out: Record<string, unknown> = { _id: obj._id, id: obj.id };
    for (const k of keys) out[k] = obj[k];
    return out;
}

function generateSlugFromTitle(title: string): string | null {
    const isEnglish = /^[a-zA-Z0-9\s\-_.,!?'"():;&@#%+=/\\]+$/.test(title);
    if (!isEnglish) return null;
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const snap = await col(COLLECTION).where('slug', '==', slug).limit(2).get();
    return snap.docs.some((d) => d.id !== excludeId);
}

/** Resolve a blog by Firestore doc id first, then by slug. */
async function resolve(idOrSlug: string) {
    const direct = await col(COLLECTION).doc(idOrSlug).get();
    if (direct.exists) return direct;
    const q = await col(COLLECTION).where('slug', '==', idOrSlug).limit(1).get();
    return q.empty ? null : q.docs[0];
}

function matchesSearch(b: BlogRaw, search?: string): boolean {
    if (!search) return true;
    const s = search.toLowerCase();
    return (b.title?.toLowerCase().includes(s) || b.description?.toLowerCase().includes(s)) ?? false;
}

function paginate<T>(rows: T[], page: number, limit: number) {
    const total = rows.length;
    const start = (page - 1) * limit;
    return {
        data: rows.slice(start, start + limit),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export const blogRepo = {
    async getGroups() {
        const snap = await col(COLLECTION).get();
        const groups = new Set<string>();
        snap.docs.forEach((d) => {
            const g = d.get('group');
            if (g) groups.add(g);
        });
        return [...groups];
    },

    async create(dto: CreateBlog) {
        const ref = col(COLLECTION).doc(); // pre-generate id for slug fallback

        let description = dto.description;
        if (!description && dto.content) {
            const firstParagraph = dto.content.find((b) => b.type === 'paragraph');
            if (firstParagraph) description = String(firstParagraph.data).substring(0, 150);
        }

        let slug = dto.slug || generateSlugFromTitle(dto.title);
        if (slug) {
            if (await isSlugTaken(slug)) slug = ref.id;
        } else {
            slug = ref.id;
        }

        await ref.set({
            title: dto.title,
            description: description ?? '',
            content: dto.content,
            tags: dto.tags ?? [],
            author: dto.author ?? '',
            group: dto.group,
            slug,
            status: dto.status ?? 'draft',
            coverImage: dto.coverImage ?? '',
            views: 0,
            ...timestamps(),
        });
        return mapDoc(await ref.get());
    },

    async findPublicPreview(search: string | undefined, page = 1, limit = 10) {
        const snap = await col(COLLECTION).where('status', '==', 'published').orderBy('createdAt', 'desc').get();
        const rows = snap.docs
            .map((d) => mapDoc<BlogRaw>(d))
            .filter((b) => matchesSearch(b, search))
            .map((b) => pick(b, PREVIEW_FIELDS));
        return paginate(rows, page, limit);
    },

    async findAdminPreview(search: string | undefined, page = 1, limit = 10) {
        const snap = await col(COLLECTION).orderBy('createdAt', 'desc').get();
        const rows = snap.docs
            .map((d) => mapDoc<BlogRaw>(d))
            .filter((b) => matchesSearch(b, search))
            .map((b) => pick(b, [...PREVIEW_FIELDS, 'status']));
        return paginate(rows, page, limit);
    },

    async findOnePublic(idOrSlug: string, incrementView = false) {
        const doc = await resolve(idOrSlug);
        if (!doc || doc.get('status') !== 'published') throw NotFound(`Blog with id "${idOrSlug}" not found`);
        if (incrementView) await doc.ref.update({ views: FieldValue.increment(1) }).catch(() => undefined);
        return mapDoc(await doc.ref.get());
    },

    async findOneAdmin(idOrSlug: string) {
        const doc = await resolve(idOrSlug);
        if (!doc) throw NotFound(`Blog with id "${idOrSlug}" not found`);
        return mapDoc(doc);
    },

    async update(idOrSlug: string, dto: UpdateBlog) {
        const doc = await resolve(idOrSlug);
        if (!doc) throw NotFound(`Blog with id "${idOrSlug}" not found`);

        const patch: Record<string, unknown> = { ...dto, ...touch() };
        if (dto.slug) {
            patch.slug = (await isSlugTaken(dto.slug, doc.id)) ? doc.id : dto.slug;
        }
        await doc.ref.update(patch);
        return mapDoc(await doc.ref.get());
    },

    async delete(idOrSlug: string) {
        const doc = await resolve(idOrSlug);
        if (!doc) throw NotFound(`Blog with id "${idOrSlug}" not found`);
        await doc.ref.delete();
    },

    async countAll() {
        return (await col(COLLECTION).count().get()).data().count;
    },

    async getMostViewed(limit = 5) {
        const snap = await col(COLLECTION).orderBy('views', 'desc').limit(limit).get();
        return snap.docs.map((d) => pick(mapDoc<BlogRaw>(d), ['title', 'views', 'coverImage', 'slug']));
    },
};
