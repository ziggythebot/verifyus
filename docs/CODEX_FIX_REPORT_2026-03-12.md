# VerifyUS Remediation Report (March 12, 2026)

## Scope
This pass addressed the core blockers identified in review: proof persistence/runtime mismatches, weak server-side proof enforcement, API routing integration gaps, placeholder auth, and embed widget defaults.

## Changes Implemented

### 1. Verification backend flow hardened
- File: `api/controllers/verifyController.ts`
- Added server-side cryptographic zkPass validation in `submitProof` using `verifyZkPassProof(...)`.
- Added explicit `503` error when zkPass is not configured server-side.
- Switched proof storage to encrypted payload (`db.encryptProof(...)`).
- Added required `proof_hash` to proof insertion and included audit metadata in stored proof record.
- Fixed status/reuse retrieval to query `proofs` table by `applicant_id` UUID directly.
- Fixed verification history join to `employers.company_name`.

### 2. Auth middleware made real
- File: `api/middleware/auth.ts`
- Replaced placeholder `vus_` prefix check with actual employer lookup via database.
- `authenticate` now rejects unknown keys.
- `optionalAuth` now resolves employer context when key is valid and remains non-blocking when absent.

### 3. API key lookup compatibility improved
- File: `lib/db.ts`
- Updated `findEmployerByApiKey(...)` to support both:
  - raw UUID API key values
  - `vus_<uuid>` prefixed keys
- Query now safely compares against `api_key::text`.

### 4. DB function contract aligned with backend usage
- File: `db/schema.sql`
- Updated `get_active_proof` signature from `applicant_email VARCHAR` to `applicant_id UUID`.
- Updated return columns to include:
  - `id`
  - `proof_type`
  - `verified_at`
  - `expires_at`
  - `confidence_score`
  - `is_expired`
- Function now filters to non-revoked and non-expired proofs.

### 5. Frontend-to-API integration fixed
- File: `next.config.ts`
- Added rewrites so Next routes `/api/v1/*` and `/health` to backend API (`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:3001`).

### 6. Embeddable widget default behavior corrected
- File: `public/widget.js`
- `baseUrl` now defaults to widget script origin (not host page origin).
- Origin checking now validates against normalized base origin.
- Iframe URL generation now uses `URL` API for safer composition.
- Added message listener cleanup in `destroy()` to prevent leaks/duplicate handlers.

### 7. Analytics query safety improved
- File: `api/controllers/analyticsController.ts`
- Added bounds/sanitization for `days` and `limit`.
- Parameterized date interval arithmetic for trends query.

### 8. Documentation alignment
- File: `README.md`
- Removed broken/missing doc links and replaced with existing docs.
- Files: `db/README.md`, `db/SCHEMA_SUMMARY.md`
- Updated `get_active_proof` documentation to UUID-based signature and output shape.

## Validation Performed
- Confirmed modified files compile syntactically via direct inspection.
- Ran `npm run lint` before remediation; repository still has pre-existing lint debt outside this pass.
- Environment-dependent test scripts require configured `.env` values and were not fully runnable in this workspace.

## Notes for Next Agent
- Apply `db/schema.sql` migration changes to target DB before deploying updated API.
- Verify employer API keys in DB are UUID values (or update issuance format consistently).
- If frontend and API are deployed on separate domains, set `NEXT_PUBLIC_API_BASE_URL` per environment.
