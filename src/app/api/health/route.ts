import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { handle } from '@/lib/http/response';
import { getDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

async function checkFirestore(): Promise<boolean> {
    try {
        await getDb().collection('_healthcheck').limit(1).get();
        return true;
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
        await s3.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET }));
        return true;
    } catch {
        return false;
    }
}

export const GET = handle(async () => {
    const [firestore, r2] = await Promise.all([checkFirestore(), checkR2()]);
    const status = firestore && r2 ? 'ok' : 'fail';
    // Same shape as the old NestJS health endpoint: { status, details }.
    return NextResponse.json({ status, details: { firestore, r2, status } }, { status: status === 'ok' ? 200 : 503 });
});
