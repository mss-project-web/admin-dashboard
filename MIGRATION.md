# Backend → Next.js + Firestore migration

The standalone NestJS backend (`Web/backend`) has been merged into this Next.js app
as API Route Handlers under `src/app/api/**`, backed by **Firestore** instead of
MongoDB. Auth now uses **Firebase Authentication** (email/password + role custom
claims, server-side session cookie). Image storage stays on **Cloudflare R2**.

Architecture (Option B): the API lives in this app. Point `api.msspsuhatyai.org`
at the same deployment as `manage.msspsuhatyai.org`. The public landing site keeps
calling `api.msspsuhatyai.org` (CORS is configured in `src/middleware.ts`).

## Layout

```
src/lib/firebase/      Firestore admin SDK + helpers (lazy init)
src/lib/auth/          JWT sign/verify, cookies (cross-subdomain), guards
src/lib/storage/r2.ts  Cloudflare R2 upload/delete (webp)
src/lib/http/          response envelope, request helpers, auto system-logging
src/lib/repositories/  one file per collection (accounts, activities, news, …)
src/lib/inputs/        multipart/json parsers (activity, prayer-room)
src/app/api/**         Route Handlers (mirror the old NestJS controllers)
scripts/               check-firebase, migrate, seed-superadmin
```

## One-time setup

1. **Create Firestore** — Firebase Console → Firestore Database → Create
   (Native mode, region e.g. `asia-southeast1`). Wait for the API to enable.
   (The service account can't enable it automatically — this is a console click.)
2. **Enable Email/Password** — Firebase Console → Authentication → Sign-in method
   → enable **Email/Password**.
3. **Fill `.env`** — `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
   `FIREBASE_PRIVATE_KEY` (service-account key), and `FIREBASE_API_KEY` (Web API
   key). R2 is already carried over. See `.env.example`.
3. **Verify connectivity**
   ```
   node --env-file=.env scripts/check-firebase.mjs
   ```
4. **Deploy indexes** (needed for favorites + blog preview queries)
   ```
   firebase deploy --only firestore:indexes
   ```
   …or create them from the links Firestore prints on first query.
5. **TTL policy** — set a Firestore TTL on `systemLogs.createdAt` (180 days) to
   replace the old Mongo `expires` behaviour:
   ```
   gcloud firestore fields ttls update createdAt \
     --collection-group=systemLogs --enable-ttl --project=msspsu-project
   ```

## Migrate data

Run from a machine that can reach MongoDB Atlas, in order:
```
# 1. Collections MongoDB -> Firestore (preserves _id as the document id)
node --env-file=.env scripts/migrate-mongo-to-firestore.mjs --dry   # counts only
node --env-file=.env scripts/migrate-mongo-to-firestore.mjs         # writes

# 2. Accounts -> Firebase Auth (keeps bcrypt passwords, sets role claims,
#    then strips the password hash out of Firestore)
node --env-file=.env scripts/import-users-to-firebase-auth.mjs
```
Firebase Auth uid == Firestore accounts doc id == original Mongo `_id`, so profiles
and Auth users stay linked and everyone keeps their existing password.

No data / fresh start instead? Seed a superadmin (creates the Auth user + claim + profile):
```
node --env-file=.env scripts/seed-superadmin.mjs admin@example.com 'password'
```

## Cut over

- `next.config.ts` no longer rewrites `/api/*` to NestJS — it hits these handlers.
- Point `api.msspsuhatyai.org` DNS at this deployment.
- In production set `COOKIE_DOMAIN=.msspsuhatyai.org` so the admin session is shared
  across `manage.*` / `api.*` (cookies switch to `SameSite=None; Secure`).
- Verify every admin page, then decommission the NestJS backend + MongoDB.

## Notes / behaviour differences

- **system-logs** now returns a single envelope (`response.data.data` is the array).
  The old NestJS double-wrapped it into an object, which the frontend could not read.
- Blog search & pagination are done in memory (Firestore has no regex/substring).
  Fine for a modest number of posts; revisit if the blog grows large.
- Auto system-logging (old `SystemLogInterceptor`) runs in `handle()` for successful
  mutations, but does not capture the request body (already consumed by the handler).
