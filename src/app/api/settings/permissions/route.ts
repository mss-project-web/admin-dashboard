import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { permissionRepo } from '@/lib/repositories/permissionRepo';
import { z } from 'zod';

const updateSchema = z.object({
    departments: z.record(z.string(), z.array(z.string())),
});

export const GET = handle(async () => {
    // Both admin and superadmin can read (admin needs it for sidebar)
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    
    const settings = await permissionRepo.getSettings();
    return ok(settings);
});

export const PUT = handle(async (req) => {
    // Only superadmin can modify permissions
    await requireRole(Role.SUPERADMIN);
    
    const body = await req.json();
    const data = updateSchema.parse(body);
    
    await permissionRepo.updateSettings(data);
    
    return ok(null, 'Permissions updated successfully');
});
