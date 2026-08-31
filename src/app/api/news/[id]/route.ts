import { cookies } from 'next/headers';
import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { newsRepo } from '@/lib/repositories/newsRepo';
import { uploadFile } from '@/lib/storage/r2';

export const GET = handle(async (_req, { params }) => {
    const { id } = await params;
    const store = await cookies();
    const cookieName = `viewed_news_${id}`;
    const hasViewed = store.has(cookieName);

    const data = await newsRepo.findOne(id, !hasViewed);
    if (!hasViewed) {
        store.set(cookieName, 'true', { maxAge: 60 * 60, httpOnly: true, path: '/' });
    }
    return ok(data, 'Fetched news by ID');
});

export const PATCH = handle(async (req, { params }) => {
    await requireMenuPermission('/admin/news');
    const { id } = await params;
    const form = await req.formData();

    const files = form.getAll('images').filter((f): f is File => f instanceof File);
    const newImages: string[] = [];
    for (const file of files) newImages.push(await uploadFile(file));

    // delete_images may arrive as a JSON string, repeated fields, or a single url.
    let deleteImages: string[] = [];
    const raw = form.getAll('delete_images').map((v) => v.toString());
    if (raw.length === 1) {
        try {
            const parsed = JSON.parse(raw[0]);
            deleteImages = Array.isArray(parsed) ? parsed : [raw[0]];
        } catch {
            deleteImages = [raw[0]];
        }
    } else if (raw.length > 1) {
        deleteImages = raw;
    }

    const dateStr = form.get('date')?.toString();
    const updated = await newsRepo.update(
        id,
        {
            name: form.get('name')?.toString(),
            date: dateStr ? new Date(dateStr) : undefined,
            link: form.get('link')?.toString(),
            description: form.get('description')?.toString(),
        },
        newImages,
        deleteImages,
    );
    return ok(updated, 'News updated successfully');
});

export const DELETE = handle(async (_req, { params }) => {
    await requireMenuPermission('/admin/news');
    const { id } = await params;
    await newsRepo.remove(id);
    return ok(null, 'News deleted successfully');
});
