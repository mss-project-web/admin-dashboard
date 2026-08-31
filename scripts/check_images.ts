import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

async function checkNewsImages() {
    console.log('Checking recent news items in Firestore...');
    const snap = await db.collection('news').orderBy('createdAt', 'desc').limit(5).get();
    snap.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`\nID: ${doc.id}`);
        console.log(`Title: ${data.name}`);
        console.log(`Source: ${data.source}`);
        console.log(`SourceId: ${data.sourceId}`);
        console.log(`Images:`, data.images);
    });
    process.exit(0);
}

checkNewsImages().catch(console.error);
