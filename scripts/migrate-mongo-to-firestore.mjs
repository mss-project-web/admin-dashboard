// One-time migration: MongoDB -> Firestore.
//   node --env-file=.env scripts/migrate-mongo-to-firestore.mjs
//   node --env-file=.env scripts/migrate-mongo-to-firestore.mjs --dry
//
// Preserves each Mongo _id as the Firestore document id so cross-references
// (userId, createdBy, ...) keep pointing at the right document. Dates become
// Firestore Timestamps. Safe to re-run (uses set(), overwrites by id).
import { MongoClient, ObjectId } from 'mongodb';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const DRY = process.argv.includes('--dry');

/**
 * Some networks block the SRV DNS lookup that `mongodb+srv://` needs. When that
 * happens, resolve the SRV + TXT records over DNS-over-HTTPS and rewrite the URI
 * to a plain `mongodb://host1,host2,.../db` connection string.
 */
async function resolveSrvIfNeeded(uri) {
    if (!uri.startsWith('mongodb+srv://')) return uri;

    const m = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
    if (!m) return uri;
    const [, auth, host, path = '/', query = ''] = m;

    const doh = async (name, type) => {
        const r = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`);
        return r.json();
    };

    try {
        const srv = await doh(`_mongodb._tcp.${host}`, 'SRV');
        const hosts = (srv.Answer || [])
            .map((a) => a.data.split(' ').slice(2)) // [port, target]
            .map(([port, target]) => `${target.replace(/\.$/, '')}:${port}`);
        if (!hosts.length) return uri;

        const txt = await doh(host, 'TXT');
        const txtParams = (txt.Answer || []).map((a) => a.data.replace(/"/g, '')).join('&');

        const base = `mongodb://${auth}@${hosts.join(',')}${path}`;
        const params = new URLSearchParams(query.replace(/^\?/, ''));
        params.set('ssl', 'true');
        for (const kv of txtParams.split('&')) {
            const [k, v] = kv.split('=');
            if (k) params.set(k, v);
        }
        console.log(`Resolved SRV via DoH -> ${hosts.length} hosts (${host})`);
        return `${base}?${params.toString()}`;
    } catch (e) {
        console.warn('DoH SRV resolution failed, using original URI:', e.message);
        return uri;
    }
}

// Mongo collection -> Firestore collection
const COLLECTIONS = [
    { mongo: 'accounts', fs: 'accounts', ensureNull: ['deletedAt', 'deletedBy', 'createdBy', 'lastLoginAt'] },
    { mongo: 'activities', fs: 'activities' },
    { mongo: 'news', fs: 'news' },
    { mongo: 'blogs', fs: 'blogs' },
    { mongo: 'prayerrooms', fs: 'prayerRooms' },
    { mongo: 'systemlogs', fs: 'systemLogs' },
];

function convert(value) {
    if (value instanceof Date) return Timestamp.fromDate(value);
    if (value instanceof ObjectId) return value.toString();
    if (Array.isArray(value)) return value.map(convert);
    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = convert(v);
        return out;
    }
    return value;
}

async function main() {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
    const mongoUri = await resolveSrvIfNeeded(process.env.MONGO_URI);

    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
    const db = getFirestore();

    const client = new MongoClient(mongoUri);
    await client.connect();
    const mongoDb = client.db();
    console.log(`Connected to MongoDB "${mongoDb.databaseName}"${DRY ? ' (DRY RUN)' : ''}\n`);

    let grandTotal = 0;
    for (const { mongo, fs, ensureNull } of COLLECTIONS) {
        const docs = await mongoDb.collection(mongo).find({}).toArray();
        console.log(`${mongo.padEnd(12)} -> ${fs.padEnd(12)} : ${docs.length} docs`);
        grandTotal += docs.length;
        if (DRY || docs.length === 0) continue;

        // Firestore batches cap at 500 writes.
        for (let i = 0; i < docs.length; i += 400) {
            const batch = db.batch();
            for (const doc of docs.slice(i, i + 400)) {
                const { _id, __v, ...rest } = doc;
                const data = convert(rest);
                if (ensureNull) for (const key of ensureNull) if (!(key in data)) data[key] = null;
                batch.set(db.collection(fs).doc(String(_id)), data);
            }
            await batch.commit();
            console.log(`  committed ${Math.min(i + 400, docs.length)}/${docs.length}`);
        }
    }

    console.log(`\nDone. ${grandTotal} documents ${DRY ? 'would be' : 'were'} migrated.`);
    await client.close();
    process.exit(0);
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
