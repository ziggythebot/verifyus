/**
 * Database connection and utility functions
 * PostgreSQL client using node-postgres (pg)
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import crypto from 'crypto';

// Environment variables validation
const DATABASE_URL = process.env.DATABASE_URL;
const PROOF_ENCRYPTION_KEY = process.env.PROOF_ENCRYPTION_KEY;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!PROOF_ENCRYPTION_KEY || PROOF_ENCRYPTION_KEY.length !== 64) {
  throw new Error('PROOF_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

// Connection pool configuration
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Pool error handler
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 */
export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult<any>> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Execute a function within a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 */
export async function close(): Promise<void> {
  await pool.end();
}

// =============================================================================
// ENCRYPTION UTILITIES
// =============================================================================

const IV_LENGTH = 16;
const ENCRYPTION_KEY_BUFFER = Buffer.from(PROOF_ENCRYPTION_KEY, 'hex');

/**
 * Encrypt proof data using AES-256-CBC
 */
export function encryptProof(proofData: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY_BUFFER,
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(proofData, 'utf8'),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt proof data
 */
export function decryptProof(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY_BUFFER,
    iv
  );
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Generate SHA-256 hash of proof data for duplicate detection
 */
export function hashProof(proofData: string): string {
  return crypto.createHash('sha256').update(proofData).digest('hex');
}

// =============================================================================
// DATABASE HELPER FUNCTIONS
// =============================================================================

/**
 * Find applicant by email
 */
export async function findApplicantByEmail(email: string) {
  const result = await query(
    'SELECT * FROM applicants WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Create new applicant
 */
export async function createApplicant(data: {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) {
  const result = await query(
    `INSERT INTO applicants (email, phone, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.email, data.phone, data.firstName, data.lastName]
  );
  return result.rows[0];
}

/**
 * Create new proof
 */
export async function createProof(data: {
  applicantId: string;
  proofData: string;
  proofType: string;
  dataSource?: string;
  confidenceScore?: number;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  // Encrypt and hash proof data
  const encryptedProof = encryptProof(data.proofData);
  const proofHash = hashProof(data.proofData);

  const result = await query(
    `INSERT INTO proofs (
      applicant_id, proof_data, proof_hash, proof_type,
      data_source, confidence_score, device_fingerprint,
      ip_address, user_agent, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.applicantId,
      encryptedProof,
      proofHash,
      data.proofType,
      data.dataSource,
      data.confidenceScore,
      data.deviceFingerprint,
      data.ipAddress,
      data.userAgent,
      JSON.stringify(data.metadata || {}),
    ]
  );
  return result.rows[0];
}

/**
 * Get active proof for applicant
 */
export async function getActiveProof(applicantId: string) {
  const result = await query(
    `SELECT * FROM proofs
     WHERE applicant_id = $1
       AND expires_at > NOW()
       AND is_revoked = FALSE
     ORDER BY verified_at DESC
     LIMIT 1`,
    [applicantId]
  );
  return result.rows[0] || null;
}

/**
 * Check if proof hash is duplicate
 */
export async function isDuplicateProof(proofHash: string): Promise<boolean> {
  const result = await query(
    'SELECT is_duplicate_proof($1) AS is_duplicate',
    [proofHash]
  );
  return result.rows[0]?.is_duplicate || false;
}

/**
 * Create verification record
 */
export async function createVerification(data: {
  applicantId: string;
  employerId: string;
  proofId: string;
  jobId?: string;
  jobTitle?: string;
  atsCandiateId?: string;
  verified: boolean;
  isReusedProof?: boolean;
  verificationMethod?: string;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  const result = await query(
    `INSERT INTO verifications (
      applicant_id, employer_id, proof_id, job_id, job_title,
      ats_candidate_id, verified, is_reused_proof,
      verification_method, failure_reason, ip_address,
      user_agent, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      data.applicantId,
      data.employerId,
      data.proofId,
      data.jobId,
      data.jobTitle,
      data.atsCandiateId,
      data.verified,
      data.isReusedProof || false,
      data.verificationMethod,
      data.failureReason,
      data.ipAddress,
      data.userAgent,
      JSON.stringify(data.metadata || {}),
    ]
  );
  return result.rows[0];
}

/**
 * Find employer by API key
 */
export async function findEmployerByApiKey(apiKey: string) {
  const result = await query(
    'SELECT * FROM employers WHERE api_key = $1 AND is_active = TRUE',
    [apiKey]
  );
  return result.rows[0] || null;
}

/**
 * Create fraud alert
 */
export async function createFraudAlert(data: {
  applicantId?: string;
  proofId?: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}) {
  const result = await query(
    `INSERT INTO fraud_alerts (
      applicant_id, proof_id, alert_type, severity,
      description, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.applicantId,
      data.proofId,
      data.alertType,
      data.severity,
      data.description,
      JSON.stringify(data.metadata || {}),
    ]
  );
  return result.rows[0];
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  userId?: string;
  userType: 'applicant' | 'employer' | 'system';
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata?: Record<string, any>;
}) {
  const result = await query(
    `INSERT INTO audit_logs (
      user_id, user_type, action, resource_type, resource_id,
      ip_address, user_agent, status, error_message, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.userId,
      data.userType,
      data.action,
      data.resourceType,
      data.resourceId,
      data.ipAddress,
      data.userAgent,
      data.status,
      data.errorMessage,
      JSON.stringify(data.metadata || {}),
    ]
  );
  return result.rows[0];
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Check database connection health
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default {
  query,
  getClient,
  transaction,
  close,
  encryptProof,
  decryptProof,
  hashProof,
  findApplicantByEmail,
  createApplicant,
  createProof,
  getActiveProof,
  isDuplicateProof,
  createVerification,
  findEmployerByApiKey,
  createFraudAlert,
  createAuditLog,
  healthCheck,
};
