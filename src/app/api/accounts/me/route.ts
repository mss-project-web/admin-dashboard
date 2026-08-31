import { z } from 'zod';
import { handle, ok, BadRequest } from '@/lib/http/response';
import { requireAuth } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';

const updateSchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6).optional(),
    currentPassword: z.string().optional(),
});

export const GET = handle(async () => {
    const user = await requireAuth();
    const account = await accountRepo.findOne(user.sub);
    return ok(account, 'Get profile successfully');
});

export const PUT = handle(async (req) => {
    const user = await requireAuth();
    const dto = updateSchema.parse(await req.json()); // role intentionally not allowed here
    
    const accountProfile = await accountRepo.findOne(user.sub);
    const updatePayload: any = { ...dto };
    if (dto.password) {
        if (!accountProfile.mustChangePassword) {
            if (!dto.currentPassword) throw BadRequest('Current password is required to change password');
            if (!(await accountRepo.verifyPassword(user.sub, dto.currentPassword))) {
                throw BadRequest('รหัสผ่านปัจจุบันไม่ถูกต้อง');
            }
        }
        updatePayload.mustChangePassword = false;
    }
    
    const account = await accountRepo.update(user.sub, updatePayload);
    return ok(account, 'Update profile successfully');
});

export const DELETE = handle(async (req) => {
    const user = await requireAuth();
    const { password } = z.object({ password: z.string().optional() }).parse(await req.json().catch(() => ({})));
    if (!password) throw BadRequest('Password is required to delete account');

    if (!(await accountRepo.verifyPassword(user.sub, password))) throw BadRequest('Invalid password');
    await accountRepo.softDelete(user.sub, user.sub);
    return ok(null, 'Account deleted successfully');
});
