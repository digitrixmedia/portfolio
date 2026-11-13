# Security Specification — Digitrix Media Portfolio & Admin Panel

## 1. Data Invariants
1. **Default-Deny Baseline**: All Firestore paths are closed by default (`match /{document=**} { allow read, write: if false; }`).
2. **Verified Admin Gate**: Only authenticated, email-verified administrators (`request.auth.token.email_verified == true` AND either `/admins/{uid}` exists or `request.auth.token.email == 'skylarkgroupindia@gmail.com'`) may create, update, publish, or delete portfolio projects, categories, media records, or settings.
3. **Published vs. Draft Isolation**: Unauthenticated public visitors can only `get` or `list` `projects` where `resource.data.status == 'published'`. Draft projects are strictly readable only by verified admins.
4. **PII Isolation**: User records in `/users/{userId}` are readable only by the record owner (`request.auth.uid == userId`) or a verified admin. Self-registration cannot assign `role: 'admin'`.
5. **Immutable Audit Fields**: `createdAt` must equal `request.time` on creation and cannot be mutated on update (`incoming().createdAt == existing().createdAt`). `updatedAt` must equal `request.time` on write.
6. **Strict Schema Enforcement**: Every write checks `keys().hasAll(...)` and `keys().hasOnly(...)` along with explicit `.size()` and type checks to prevent shadow fields and payload bloat.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `create` on `/projects/proj-1`
2. Unauthenticated `list` on `/projects` without `where('status', '==', 'published')`
3. Unauthenticated `get` on `/projects/draft-proj` where `status == 'draft'`
4. Unauthenticated `read` on `/users/uid-123`
5. Authenticated non-admin user attempting `create` on `/users/uid-123` with `role: 'admin'`
6. Authenticated user with `email_verified: false` spoofing admin email writing to `/projects/proj-2`
7. Authenticated non-admin updating `status: 'published'` on `/projects/proj-1`
8. Admin payload with shadow field `isVerified: true` on `/projects/proj-1`
9. Admin payload with oversized `title` (> 160 chars) on `/projects/proj-1`
10. Admin payload with forged past `createdAt` timestamp (not `request.time`)
11. Unauthenticated `read` or `write` on `/media/media-1`
12. Authenticated non-admin writing to `/settings/website` or `/categories/cat-1`
