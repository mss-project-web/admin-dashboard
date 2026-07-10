// Create an initial superadmin in Firebase Auth + Firestore profile.
//   node --env-file=.env scripts/seed-superadmin.mjs <email> <password> [firstName] [lastName]
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const [email, password, firstName = 'Super', lastName = 'Admin'] = process.argv.slice(2);
if (!email || !password) {
    console.error('Usage: node --env-file=.env scripts/seed-superadmin.mjs <email> <password> [firstName] [lastName]');
    process.exit(1);
}

initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});
const db = getFirestore();
const auth = getAuth();

const normalized = email.toLowerCase().trim();

let uid;
try {
    const existing = await auth.getUserByEmail(normalized);
    uid = existing.uid;
    await auth.updateUser(uid, { password });
    console.log(`User already existed, password reset (${uid}).`);
} catch {
    const created = await auth.createUser({
        email: normalized,
        password,
        displayName: `${firstName} ${lastName}`.trim(),
        emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created Auth user (${uid}).`);
}

await auth.setCustomUserClaims(uid, { role: 'superadmin' });

await db.collection('accounts').doc(uid).set(
    {
        email: normalized,
        firstName,
        lastName,
        phoneNumber: null,
        role: 'superadmin',
        createdBy: null,
        lastLoginAt: null,
        deletedAt: null,
        deletedBy: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
);

console.log(`Superadmin ready: ${normalized} (${uid}).`);
process.exit(0);
