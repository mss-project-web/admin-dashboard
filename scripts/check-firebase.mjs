// Quick connectivity check: node --env-file=.env scripts/check-firebase.mjs
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});

const db = getFirestore(app);
const ref = db.collection('_healthcheck').doc('ping');
await ref.set({ at: new Date().toISOString() });
const snap = await ref.get();
console.log('OK  Firestore write+read:', snap.data());
await ref.delete();
console.log('OK  cleaned up. Firebase Admin is working.');
process.exit(0);
