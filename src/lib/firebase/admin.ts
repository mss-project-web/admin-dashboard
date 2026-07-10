import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK singleton (server-only), lazily initialised so importing a
 * route module never throws before credentials are configured (matters at build).
 *
 * Credentials come from environment variables:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (escaped "\n" newlines supported)
 */
let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

function createApp(): App {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
        );
    }

    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function app(): App {
    if (!cachedApp) cachedApp = getApps()[0] ?? createApp();
    return cachedApp;
}

export function getDb(): Firestore {
    if (cachedDb) return cachedDb;
    const firestore = getFirestore(app());
    // Ignore `undefined` fields when writing (Mongoose-like optional fields).
    // settings() may only run once per Firestore instance; across dev HMR our
    // module cache resets while the underlying instance persists, so tolerate
    // the "already initialized" error instead of crashing every request.
    try {
        firestore.settings({ ignoreUndefinedProperties: true });
    } catch {
        /* settings already applied on this instance */
    }
    cachedDb = firestore;
    return cachedDb;
}

export function getAdminAuth(): Auth {
    if (!cachedAuth) cachedAuth = getAuth(app());
    return cachedAuth;
}
