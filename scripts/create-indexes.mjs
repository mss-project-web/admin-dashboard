// Create the composite indexes from firestore.indexes.json via the Firestore
// Admin API using the service-account credentials (no firebase CLI needed).
//   node --env-file=.env scripts/create-indexes.mjs
import { GoogleAuth } from 'google-auth-library';

const projectId = process.env.FIREBASE_PROJECT_ID;

const INDEXES = [
    { collection: 'activities', fields: [
        { fieldPath: 'favorite', order: 'ASCENDING' },
        { fieldPath: 'updatedAt', order: 'DESCENDING' },
    ] },
    { collection: 'blogs', fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
    ] },
];

const auth = new GoogleAuth({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
const client = await auth.getClient();

for (const idx of INDEXES) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${idx.collection}/indexes`;
    try {
        const res = await client.request({
            url,
            method: 'POST',
            data: { queryScope: 'COLLECTION', fields: idx.fields },
        });
        console.log(`${idx.collection}: creating -> ${res.data?.name || 'ok'}`);
    } catch (e) {
        const msg = JSON.stringify(e.response?.data?.error?.message || e.message);
        if (msg.includes('already exists')) console.log(`${idx.collection}: already exists`);
        else console.log(`${idx.collection}: FAILED ${msg}`);
    }
}

console.log('\nIndexes build in the background (~1-2 min). Re-test the endpoints after.');
process.exit(0);
