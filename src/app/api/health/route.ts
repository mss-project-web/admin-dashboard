import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { handle, ok, failBody } from '@/lib/http/response';
import { getDb } from '@/lib/firebase/admin';

const HEALTH_TIMEOUT_MS = 8_000;

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            promise,
            new Promise<T>((resolve) => {
                timer = setTimeout(() => resolve(fallback), HEALTH_TIMEOUT_MS);
            }),
        ]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function checkFirestore(): Promise<boolean> {
    try {
        return await withTimeout(
            getDb().collection('_healthcheck').limit(1).get().then(() => true),
            false,
        );
    } catch {
        return false;
    }
}

async function checkR2(): Promise<boolean> {
    try {
        const s3 = new S3Client({
            region: process.env.R2_REGION ?? '',
            endpoint: process.env.R2_ENDPOINT ?? '',
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
            },
        });
        return await withTimeout(
            s3.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET })).then(() => true),
            false,
        );
    } catch {
        return false;
    }
}

export const GET = handle(async () => {
    const [firestore, r2] = await Promise.all([checkFirestore(), checkR2()]);
    const details = { firestore, r2 };
    if (firestore && r2) return ok(details, 'Health check passed');
    return failBody('Health check failed', 503, details);
});
