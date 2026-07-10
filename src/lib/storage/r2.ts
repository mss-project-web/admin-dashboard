import 'server-only';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Cloudflare R2 storage (S3-compatible), ported from the NestJS CloudflareService.
 * Images are converted to WebP before upload, same as before.
 */
let client: S3Client | null = null;

function s3(): S3Client {
    if (client) return client;
    const { R2_REGION, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_DOMAIN } = process.env;
    if (!R2_REGION || !R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_DOMAIN) {
        throw new Error('Missing required Cloudflare R2 environment variables');
    }
    client = new S3Client({
        region: R2_REGION,
        endpoint: R2_ENDPOINT,
        credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
    return client;
}

/** Upload an image buffer as WebP, returns the public URL. */
export async function uploadImage(buffer: Buffer): Promise<string> {
    const key = `${uuidv4()}.webp`;
    const webp = await sharp(buffer).webp({ quality: 100 }).toBuffer();

    await s3().send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
            Body: webp,
            ContentType: 'image/webp',
        }),
    );

    return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}

/** Convenience helper for a Web API File (from route handler formData). */
export async function uploadFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return uploadImage(buffer);
}

/** Delete a file by its public URL. Logs (does not throw) on failure. */
export async function deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.split('/').pop();
    if (!key) {
        console.warn(`Invalid file URL for deletion: ${fileUrl}`);
        return;
    }
    try {
        await s3().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
    } catch (error) {
        console.error(`Failed to delete file from R2: ${key}`, error);
    }
}
