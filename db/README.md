# Database Setup Guide

## Prerequisites

- PostgreSQL 16+ installed
- Database credentials (host, port, database name, user, password)

## Quick Start

### 1. Create Database

```bash
# Using psql
createdb verifyus

# Or using SQL
psql -U postgres -c "CREATE DATABASE verifyus;"
```

### 2. Run Schema Migration

```bash
# From project root
psql -U postgres -d verifyus -f db/schema.sql
```

### 3. Verify Installation

```bash
psql -U postgres -d verifyus -c "\dt"
```

You should see 7 tables:
- `applicants`
- `employers`
- `proofs`
- `verifications`
- `fraud_alerts`
- `webhook_events`
- `audit_logs`

## Schema Overview

### Core Tables

#### `applicants`
Stores applicant identity and verification metadata.
- Primary key: `id` (UUID)
- Unique: `email`
- Tracks: verification count, last verification date, block status

#### `employers`
Stores employer account information and API credentials.
- Primary key: `id` (UUID)
- Unique: `email`, `api_key`
- Stores: ATS integration credentials, subscription tier, verification quota

#### `proofs`
Stores encrypted ZK proofs with expiration and metadata.
- Primary key: `id` (UUID)
- Foreign key: `applicant_id` → `applicants.id`
- Unique: `proof_hash` (for duplicate detection)
- **Encrypted field**: `proof_data` (AES-256)
- Auto-expires: 90 days from `verified_at`

#### `verifications`
Audit log of all verification attempts and results.
- Primary key: `id` (UUID)
- Foreign keys: `applicant_id`, `employer_id`, `proof_id`
- Tracks: success/failure, reuse status, ATS integration metadata

### Supplementary Tables

#### `fraud_alerts`
Tracks suspicious activity and fraud detection events.
- Alert types: `duplicate_proof`, `suspicious_device`, `rapid_reuse`
- Severities: `low`, `medium`, `high`, `critical`

#### `webhook_events`
Logs all incoming webhook events from ATS providers (Greenhouse, Lever).
- Stores full webhook payload as JSONB
- Tracks processing status and retries

#### `audit_logs`
General audit trail for security and compliance.
- Tracks all user actions (applicants and employers)
- Stores IP addresses, user agents, error messages

## Views

### `active_proofs`
Returns all non-expired, non-revoked proofs with applicant details.

```sql
SELECT * FROM active_proofs WHERE email = 'applicant@example.com';
```

### `employer_verification_stats`
Per-employer verification statistics.

```sql
SELECT * FROM employer_verification_stats WHERE employer_id = 'YOUR_UUID';
```

### `fraud_summary`
Daily fraud alert statistics by type and severity.

```sql
SELECT * FROM fraud_summary WHERE date >= NOW() - INTERVAL '7 days';
```

## Functions

### `get_active_proof(applicant_email VARCHAR)`
Returns the most recent active proof for an applicant.

```sql
SELECT * FROM get_active_proof('applicant@example.com');
```

Returns:
- `proof_id`
- `proof_type`
- `verified_at`
- `expires_at`
- `is_expired` (boolean)

### `is_duplicate_proof(hash VARCHAR)`
Checks if a proof hash already exists in the database.

```sql
SELECT is_duplicate_proof('abc123def456...');
```

## Triggers

### Auto-update `updated_at`
- `applicants.updated_at`
- `employers.updated_at`

Automatically updates timestamp on row modification.

### Auto-set `expires_at`
- `proofs.expires_at`

Automatically sets expiration to 90 days from `verified_at` if not provided.

### Update applicant verification stats
- `applicants.verification_count`
- `applicants.last_verified_at`

Automatically increments count and updates timestamp when a successful verification is recorded.

## Indexes

Performance indexes are created for:
- Email lookups (`applicants.email`, `employers.email`)
- API key lookups (`employers.api_key`)
- Proof expiration queries (`proofs.expires_at`)
- Duplicate detection (`proofs.proof_hash`)
- Verification analytics (`verifications.employer_id`, `verifications.verified_at`)
- Fraud alert queries (`fraud_alerts.is_resolved`)

## Security Considerations

### Encrypted Fields

The `proofs.proof_data` field stores sensitive ZK proof data. Encryption should be handled at the application layer using AES-256.

**Example (Node.js with crypto):**

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.PROOF_ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encryptProof(proofData: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(proofData), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptProof(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}
```

### Password Hashing

Employer passwords are stored as bcrypt hashes. Use bcrypt with cost factor 10+.

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(plainPassword, 10);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

## Environment Variables

Required environment variables for database connection:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/verifyus
PROOF_ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

## Production Deployment

### Recommended Services

- **Supabase** (PostgreSQL + Auth)
- **Neon** (Serverless PostgreSQL)
- **Railway** (PostgreSQL + API hosting)

### Connection Pooling

For production, use connection pooling (PgBouncer or native pooling):

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Backups

Set up automated daily backups:

```bash
# Cron job example (daily at 2 AM)
0 2 * * * pg_dump -U postgres verifyus | gzip > /backups/verifyus_$(date +\%Y\%m\%d).sql.gz
```

## Testing

### Sample Data

The schema includes one test employer account:

**Email:** `admin@test-agency.com`
**Password:** `test123`

### Test Queries

```sql
-- Check if schema loaded correctly
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Test triggers
INSERT INTO applicants (email) VALUES ('test@example.com') RETURNING *;

-- Test functions
SELECT * FROM get_active_proof('test@example.com');
SELECT is_duplicate_proof('nonexistent_hash');

-- Test views
SELECT * FROM active_proofs LIMIT 10;
SELECT * FROM employer_verification_stats;
```

## Troubleshooting

### Extensions Not Found

If you get "extension does not exist" errors:

```sql
-- Run as superuser
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Permission Errors

Grant necessary permissions:

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
```

## Migration Strategy

For future schema changes, create numbered migration files:

```
db/
  migrations/
    001_initial_schema.sql (this file)
    002_add_blockchain_fields.sql
    003_add_performance_indexes.sql
```

Use a migration tool like:
- **node-pg-migrate**
- **TypeORM migrations**
- **Prisma Migrate**

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgcrypto Extension](https://www.postgresql.org/docs/current/pgcrypto.html)
- [UUID Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)
