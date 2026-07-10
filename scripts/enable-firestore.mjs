// Try to enable the Firestore API and create the (default) database using the
// service-account credentials. Requires the SA to have enough IAM permission
// (Editor/Owner). Falls back with a clear message otherwise.
//   node --env-file=.env scripts/enable-firestore.mjs
import { GoogleAuth } from 'google-auth-library';

const projectId = process.env.FIREBASE_PROJECT_ID;
const location = process.argv[2] || 'asia-southeast1';

const auth = new GoogleAuth({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
const client = await auth.getClient();

async function call(url, method = 'POST', data) {
    try {
        const res = await client.request({ url, method, data });
        return { ok: true, data: res.data };
    } catch (e) {
        return { ok: false, status: e.response?.status, error: e.response?.data?.error || e.message };
    }
}

console.log('1) Enabling firestore.googleapis.com ...');
let r = await call(`https://serviceusage.googleapis.com/v1/projects/${projectId}/services/firestore.googleapis.com:enable`);
console.log(r.ok ? '   enabled (or already enabled)' : `   FAILED: ${JSON.stringify(r.error)}`);
if (!r.ok) {
    console.log('\nThe service account lacks permission to enable APIs.');
    console.log('Enable it in the console, then create the database:');
    console.log(`  https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${projectId}`);
    process.exit(1);
}

// Give the enablement a moment to propagate.
await new Promise((res) => setTimeout(res, 8000));

console.log(`2) Creating (default) database in ${location} ...`);
r = await call(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=(default)`,
    'POST',
    { type: 'FIRESTORE_NATIVE', locationId: location },
);
if (r.ok) {
    console.log('   create operation started:', r.data?.name || 'ok');
} else if (JSON.stringify(r.error).includes('ALREADY_EXISTS')) {
    console.log('   database already exists.');
} else {
    console.log(`   FAILED: ${JSON.stringify(r.error)}`);
    process.exit(1);
}

console.log('\nDone. Wait ~1 minute, then run: node --env-file=.env scripts/check-firebase.mjs');
process.exit(0);
