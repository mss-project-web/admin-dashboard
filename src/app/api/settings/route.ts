import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { settingsRepo } from '@/lib/repositories/settingsRepo';

const schema = z.object({
    contact: z.object({
        phones: z.array(z.object({ label: z.string(), number: z.string() })).default([]),
        email: z.string().default(''),
        socials: z
            .object({
                facebook: z.string().optional(),
                instagram: z.string().optional(),
                youtube: z.string().optional(),
                line: z.string().optional(),
                tiktok: z.string().optional(),
            })
            .default({}),
        address: z.string().optional(),
        mapUrl: z.string().optional(),
        openingHours: z.string().optional(),
    }),
    donation: z.object({
        bankName: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        promptpay: z.string().optional(),
        qrImage: z.string().optional(),
        note: z.string().optional(),
    }),
});

export const GET = handle(async () => {
    const settings = await settingsRepo.get();
    // Not cached: admins expect contact/donation edits to show immediately.
    return ok(settings, 'Fetched site settings');
});

export const PUT = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const data = schema.parse(await req.json());
    const updated = await settingsRepo.update(data);
    return ok(updated, 'Site settings updated');
});
