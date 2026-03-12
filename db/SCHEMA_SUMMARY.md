# PostgreSQL Database Schema - Summary

## Overview

Complete PostgreSQL database schema for VerifyUS MVP with 7 core tables, 3 views, 2 utility functions, and automated triggers for data integrity.

## Files Created

```
db/
├── schema.sql              # Complete database schema with tables, indexes, triggers
├── setup.sh                # Automated setup script (creates DB, applies schema)
├── test-connection.ts      # Test suite for database operations
├── README.md               # Comprehensive setup and usage guide
└── SCHEMA_SUMMARY.md       # This file

lib/
└── db.ts                   # Node.js database client with helper functions

.env.example                # Environment variable template
```

## Database Tables

### 1. `applicants` (7 fields)
Stores applicant identity and verification metadata.

**Key Features:**
- UUID primary key
- Unique email constraint
- Tracks verification count and last verification date
- Block/unblock capability for fraud prevention
- Auto-updated `updated_at` timestamp (trigger)

### 2. `employers` (15 fields)
Employer accounts with ATS integration credentials.

**Key Features:**
- UUID API keys for authentication
- Encrypted ATS credentials storage
- Subscription tier tracking (per_verification, growth, enterprise)
- Verification quota management
- Auto-updated `updated_at` timestamp (trigger)

### 3. `proofs` (17 fields)
Encrypted ZK proofs with expiration and fraud detection.

**Key Features:**
- **AES-256 encrypted** `proof_data` field
- SHA-256 `proof_hash` for duplicate detection
- Auto-expires 90 days from `verified_at` (trigger)
- Device fingerprinting for fraud detection
- Optional blockchain transaction hash
- Revocation support
- JSONB metadata for flexible data

### 4. `verifications` (13 fields)
Audit log of all verification attempts.

**Key Features:**
- Links applicants, employers, and proofs
- Tracks proof reuse (cost savings metric)
- ATS integration metadata (job ID, candidate ID)
- Success/failure tracking with reasons
- JSONB metadata for custom fields
- Auto-updates applicant stats (trigger)

### 5. `fraud_alerts` (11 fields)
Suspicious activity detection and tracking.

**Alert Types:**
- `duplicate_proof` - Same proof used by multiple applicants
- `suspicious_device` - Unusual device fingerprint
- `rapid_reuse` - Proof reused too quickly
- Custom types as needed

**Severities:** low, medium, high, critical

### 6. `webhook_events` (9 fields)
Incoming webhook queue from ATS providers.

**Key Features:**
- Full payload storage (JSONB)
- Processing status tracking
- Automatic retry logic (retry_count)
- Error message logging
- Supports Greenhouse, Lever, and custom ATS

### 7. `audit_logs` (12 fields)
Security and compliance audit trail.

**Key Features:**
- Tracks all user actions (applicants, employers, system)
- Resource-level auditing
- IP address and user agent logging
- Success/failure status
- JSONB metadata for flexible logging

## Views

### `active_proofs`
Pre-filtered view of valid proofs (not expired, not revoked) with applicant details.

### `employer_verification_stats`
Per-employer analytics:
- Total verifications
- Success/failure counts
- Proof reuse rate
- First/last verification dates

### `fraud_summary`
Daily fraud alert statistics by type and severity.

## Functions

### `get_active_proof(applicant_id UUID)`
Returns most recent active proof for an applicant with expiration status.

### `is_duplicate_proof(hash VARCHAR)`
Boolean check if a proof hash already exists.

## Triggers

### Auto-Update Timestamps
- `applicants.updated_at`
- `employers.updated_at`

### Auto-Set Proof Expiration
- `proofs.expires_at` → defaults to 90 days from `verified_at`

### Update Applicant Statistics
- Increments `verification_count`
- Updates `last_verified_at`
- Triggered on successful verification

## Indexes

### Performance Indexes
- `idx_applicants_email` - Fast email lookups
- `idx_applicants_last_verified` - Verification queries
- `idx_employers_api_key` - API authentication
- `idx_proofs_applicant_id` - Applicant proof queries
- `idx_proofs_expires_at` - Expiration checks
- `idx_proofs_proof_hash` - Duplicate detection
- `idx_verifications_employer_id` - Employer analytics
- `idx_verifications_verified_at` - Time-based queries
- `idx_fraud_alerts_unresolved` - Fraud queue processing
- `idx_webhook_events_processed` - Webhook queue

## Security Features

### Encryption
- **Proof data:** AES-256-CBC encryption at application layer
- **ATS credentials:** Encrypted before storage
- **Password hashing:** bcrypt with cost factor 10+

### Audit Trail
- All API calls logged in `audit_logs`
- All verification attempts logged in `verifications`
- Webhook events preserved with full payloads
- IP addresses and user agents tracked

### Data Integrity
- Foreign key constraints with cascade/set null rules
- Unique constraints on emails and API keys
- NOT NULL constraints on critical fields
- Check constraints (e.g., confidence_score 0.00-1.00)

## Node.js Helper Functions

The `lib/db.ts` module provides:

### Connection Management
- `query()` - Execute SQL with parameters
- `getClient()` - Get pooled client for transactions
- `transaction()` - Execute callback within transaction
- `close()` - Close all connections

### Encryption
- `encryptProof()` - AES-256 encryption
- `decryptProof()` - Decrypt proof data
- `hashProof()` - SHA-256 hash for duplicate detection

### Database Operations
- `findApplicantByEmail()`
- `createApplicant()`
- `createProof()` - Auto-encrypts and hashes
- `getActiveProof()`
- `isDuplicateProof()`
- `createVerification()`
- `findEmployerByApiKey()`
- `createFraudAlert()`
- `createAuditLog()`
- `healthCheck()`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install pg bcrypt dotenv
npm install --save-dev @types/pg @types/bcrypt
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/verifyus
PROOF_ENCRYPTION_KEY=$(openssl rand -hex 32)
```

### 3. Run Setup Script

```bash
npm run db:setup
```

Or manually:
```bash
cd db && ./setup.sh
```

### 4. Test Connection

```bash
npx tsx db/test-connection.ts
```

## Production Deployment

### Recommended Services
- **Supabase** - PostgreSQL + Auth + Backups
- **Neon** - Serverless PostgreSQL
- **Railway** - PostgreSQL + API hosting

### Configuration
- Enable connection pooling (PgBouncer)
- Set up automated daily backups
- Configure read replicas for analytics queries
- Enable SSL/TLS for all connections
- Rotate encryption keys quarterly

### Monitoring
- Track slow queries (pg_stat_statements)
- Monitor connection pool utilization
- Set up alerts for failed verification spikes
- Track fraud alert resolution times

## Migration Strategy

For future schema changes:

1. Create numbered migration file: `migrations/002_add_field.sql`
2. Test on staging database
3. Apply during maintenance window
4. Verify with integration tests

### Recommended Tools
- **node-pg-migrate** - Programmatic migrations
- **TypeORM** - ORM with built-in migrations
- **Prisma** - Type-safe ORM with schema versioning

## Next Steps

1. ✅ Database schema created
2. ⏳ Create Express API server
3. ⏳ Build verification endpoints (`POST /api/v1/verify`)
4. ⏳ Integrate zkPass SDK
5. ⏳ Build frontend verification widget

## Cost Estimates (Production)

**Monthly Database Costs:**
- Supabase Pro: $25/mo (8GB database, 100GB bandwidth)
- Neon: $19/mo (3 compute units, auto-scaling)
- Railway: $25/mo (8GB RAM, 50GB storage)

**For 10,000 verifications/month:**
- Storage: ~500MB (with encrypted proofs)
- Queries: ~100,000 (reads + writes)
- Backups: ~2GB/month

All within free/starter tier limits for MVP.

## Support

- Database docs: `db/README.md`
- Test suite: `db/test-connection.ts`
- Helper functions: `lib/db.ts`
- Schema: `db/schema.sql`
