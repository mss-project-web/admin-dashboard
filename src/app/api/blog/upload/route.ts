import { handle, ok, BadRequest } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { uploadFile } from '@/lib/storage/r2';
import { enforceRateLimit, rateLimitKey } from '@/lib/security/rateLimit';
import { TooManyRequests } from '@/lib/http/response';

export const POST = handle(async (req) => {
    await requireMenuPermission('/admin/blog/content');
    try {
        enforceRateLimit(rateLimitKey(req, 'image-upload'), 30, 60 * 60 * 1000);
    } catch (error) {
        if (error instanceof Error && error.message === 'RATE_LIMITED') throw TooManyRequests('อัปโหลดบ่อยเกินไป กรุณาลองใหม่ภายหลัง');
        throw error;
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw BadRequest('file is required');
    const url = await uploadFile(file);
    return ok({ url }, 'Uploaded');
});
