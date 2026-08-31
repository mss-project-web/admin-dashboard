import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin
if (!getApps().length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
}

const db = getFirestore();

// Initialize R2 client if configured
let r2Client: S3Client | null = null;
if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_ENDPOINT) {
    r2Client = new S3Client({
        region: process.env.R2_REGION || 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
}

function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function firstImage(html: string): string | null {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : null;
}

async function uploadToR2(buf: Buffer): Promise<string | null> {
    if (!r2Client || !process.env.R2_BUCKET || !process.env.R2_PUBLIC_DOMAIN) return null;
    try {
        const id = uuidv4();
        const key = `news/${id}.jpg`;
        await r2Client.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET,
                Key: key,
                Body: buf,
                ContentType: 'image/jpeg',
            })
        );
        const domain = process.env.R2_PUBLIC_DOMAIN.replace(/\/+$/, '');
        return `${domain}/${key}`;
    } catch (e: any) {
        console.warn('R2 upload failed:', e.message);
        return null;
    }
}

async function runSync() {
    const feedUrl = 'https://rss.app/feeds/v1.1/OD9nrTmGQtIDreCx.json';
    console.log('🚀 Fetching posts from RSS.app:', feedUrl);

    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'MSS-News-Sync/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const items = data.items || [];
    console.log(`Found ${items.length} items in RSS.app feed.`);

    // Reverse to process oldest first
    items.reverse();

    let imported = 0;
    let skipped = 0;

    for (const it of items) {
        const link = String(it.url || it.external_url || '');
        const guid = String(it.id || link);
        const rawText = String(it.content_text || '') || stripHtml(String(it.content_html || ''));
        const text = stripHtml(rawText);
        
        const rawTitle = String(it.title || '').trim();
        const title = rawTitle && rawTitle.length > 3 ? rawTitle : text.split('\n')[0].slice(0, 120) || 'โพสต์จาก Facebook';
        const dateStr = String(it.date_published || it.date_modified || '');
        const date = dateStr ? new Date(dateStr) : new Date();

        const imageCandidate = typeof it.image === 'string' ? it.image : (firstImage(String(it.content_html || '')) || null);

        // Check if already exists in Firestore
        const existingSnap = await db.collection('news').where('sourceId', '==', guid).limit(1).get();
        if (!existingSnap.empty) {
            console.log(`[SKIPPED] Post already in DB (GUID: ${guid.slice(0, 15)}...): "${title.slice(0, 35)}..."`);
            skipped++;
            continue;
        }

        const images: string[] = [];
        if (imageCandidate) {
            try {
                const imgRes = await fetch(imageCandidate);
                if (imgRes.ok) {
                    const buf = Buffer.from(await imgRes.arrayBuffer());
                    const r2Url = await uploadToR2(buf);
                    if (r2Url) images.push(r2Url);
                }
            } catch (e: any) {
                console.warn(`Failed image fetch/upload for ${guid}:`, e.message);
            }
        }

        const docRef = await db.collection('news').add({
            name: title,
            description: text,
            link: link,
            date: Timestamp.fromDate(date),
            images: images,
            views: 0,
            source: 'facebook',
            sourceId: guid,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        imported++;
        console.log(`[IMPORTED] Created news document ${docRef.id}: "${title.slice(0, 35)}..."`);
    }

    console.log(`\n🎉 Sync complete! Total: ${items.length}, Imported: ${imported}, Skipped: ${skipped}`);
    process.exit(0);
}

runSync().catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
});
