import { handle, ok, BadRequest } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { uploadFile } from '@/lib/storage/r2';

export const POST = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw BadRequest('file is required');
    const url = await uploadFile(file);
    return ok({ url }, 'Uploaded');
});
