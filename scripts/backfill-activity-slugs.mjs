// Give existing activities a URL slug (from English name, else Thai name).
//   node --env-file=.env scripts/backfill-activity-slugs.mjs
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});
const db = getFirestore();

function slugify(nameEng, nameTh, fallback) {
    const src = nameEng && /[a-zA-Z]/.test(nameEng) ? nameEng : nameTh || '';
    const slug = String(src)
        .toLowerCase()
        .trim()
        .replace(/[^฀-๿a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug || fallback;
}

const snap = await db.collection('activities').get();
const used = new Set(snap.docs.map((d) => d.get('slug')).filter(Boolean));

let updated = 0;
for (const doc of snap.docs) {
    if (doc.get('slug')) continue; // already has one
    const d = doc.data();
    let slug = slugify(d.name_eng, d.name_th, doc.id);
    if (used.has(slug)) slug = `${slug}-${doc.id.slice(0, 6)}`;
    used.add(slug);
    await doc.ref.update({ slug });
    console.log(`  ${doc.id} -> ${slug}`);
    updated++;
}

console.log(`\nDone. ${updated} activities updated.`);
process.exit(0);
