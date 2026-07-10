// Import the migrated Firestore `accounts` into Firebase Authentication,
// preserving the original bcrypt passwords and setting role custom claims.
// Run AFTER migrate-mongo-to-firestore.mjs.
//   node --env-file=.env scripts/import-users-to-firebase-auth.mjs
//   node --env-file=.env scripts/import-users-to-firebase-auth.mjs --keep-passwords
//
// Firebase Auth uid == Firestore accounts doc id (== original Mongo _id), so the
// profile document and the Auth user stay linked. The plaintext-less bcrypt hash
// is removed from Firestore afterwards unless --keep-passwords is given.
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const KEEP = process.argv.includes('--keep-passwords');

initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});
const db = getFirestore();
const auth = getAuth();

const snap = await db.collection('accounts').get();
if (snap.empty) {
    console.log('No accounts in Firestore. Run the data migration first.');
    process.exit(0);
}

const users = [];
const claims = []; // { uid, role }
for (const doc of snap.docs) {
    const d = doc.data();
    if (!d.email) {
        console.warn(`  skip ${doc.id}: no email`);
        continue;
    }
    claims.push({ uid: doc.id, role: d.role || 'user' });

    // Skip accounts with no stored password hash (e.g. one seeded directly in
    // Firebase Auth) so we don't overwrite an already-working Auth user.
    if (!d.password) {
        console.log(`  skip import for ${d.email} (no password hash; claim still set)`);
        continue;
    }
    users.push({
        uid: doc.id,
        email: String(d.email).toLowerCase().trim(),
        emailVerified: true,
        displayName: [d.firstName, d.lastName].filter(Boolean).join(' ') || undefined,
        disabled: !!d.deletedAt,
        passwordHash: Buffer.from(String(d.password)), // bcrypt modular-crypt string
    });
}

console.log(`Importing ${users.length} users into Firebase Auth ...`);
const result = await auth.importUsers(users, { hash: { algorithm: 'BCRYPT' } });
console.log(`  success: ${result.successCount}, failure: ${result.failureCount}`);
result.errors.forEach((e) => console.error(`  [${users[e.index]?.email}] ${e.error.message}`));

console.log('Setting role custom claims ...');
for (const { uid, role } of claims) {
    try {
        await auth.setCustomUserClaims(uid, { role });
    } catch (e) {
        console.error(`  claim failed for ${uid}: ${e.message}`);
    }
}

if (!KEEP) {
    console.log('Removing password hashes from Firestore profiles ...');
    for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = db.batch();
        for (const doc of snap.docs.slice(i, i + 400)) {
            batch.update(doc.ref, { password: FieldValue.delete() });
        }
        await batch.commit();
    }
}

console.log('\nDone.');
process.exit(0);
