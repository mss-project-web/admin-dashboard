import { handle, ok, BadRequest } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { newsRepo } from '@/lib/repositories/newsRepo';
import { uploadFile } from '@/lib/storage/r2';
import { withCache } from '@/lib/cache';

export const GET = handle(async (req) => {
    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');

    if (monthStr && yearStr) {
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
            throw BadRequest('Invalid month or year parameter');
        }
        const cacheKey = `api_news_${month}_${year}`;
        const data = await withCache(cacheKey, 120000, () => newsRepo.getNewsByMonthAndYear(month, year));
        return ok(data, `Fetched news for ${month}/${year}`);
    }

    const data = await withCache('api_news_all', 120000, () => newsRepo.findAll());
    return ok(data, 'Fetched all news');
});

export const POST = handle(async (req) => {
    await requireMenuPermission('/admin/news');
    const form = await req.formData();

    const files = form.getAll('images').filter((f): f is File => f instanceof File);
    const images: string[] = [];
    for (const file of files) images.push(await uploadFile(file));

    const dateStr = form.get('date')?.toString();
    const created = await newsRepo.create(
        {
            name: form.get('name')?.toString(),
            date: dateStr ? new Date(dateStr) : undefined,
            link: form.get('link')?.toString(),
            description: form.get('description')?.toString(),
        },
        images,
    );
    // create was returned raw (single envelope) in the old backend
    return ok(created, 'News created successfully', 201);
});
