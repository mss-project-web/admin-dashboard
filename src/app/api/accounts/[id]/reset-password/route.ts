import { handle, ok, TooManyRequests } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';
import { getAdminAuth } from '@/lib/firebase/admin';
import { enforceRateLimit, rateLimitKey } from '@/lib/security/rateLimit';
import { randomInt } from 'node:crypto';

// Generate a secure random password
function generateSecurePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(randomInt(0, n));
    }
    return password;
}

export const POST = handle(async (req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    try {
        enforceRateLimit(rateLimitKey(req, 'admin-password-reset'), 10, 60 * 60 * 1000);
    } catch (error) {
        if (error instanceof Error && error.message === 'RATE_LIMITED') throw TooManyRequests('รีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ภายหลัง');
        throw error;
    }
    
    const uid = (await params).id;
    // Verify user exists
    await accountRepo.findOne(uid);

    const tempPassword = generateSecurePassword();

    // Force update password in Firebase Auth directly
    await getAdminAuth().updateUser(uid, { password: tempPassword });
    
    // Set flag to force password change on next login
    await accountRepo.update(uid, { mustChangePassword: true });
    
    // Revoke all existing sessions to force them to log in again with new password
    await getAdminAuth().revokeRefreshTokens(uid);

    return ok({ tempPassword }, 'Temporary password generated successfully');
});
