/**
 * zkPass Zero-Knowledge Proof Types
 *
 * Type definitions for US work authorization verification proofs
 */

/**
 * Supported proof verification methods
 */
export type ProofType =
  | "us_passport"
  | "state_id"
  | "ssn_address"
  | "bank_account";

/**
 * US states for address verification
 */
export type USState =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "FL" | "GA"
  | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME" | "MD"
  | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH" | "NJ"
  | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI" | "SC"
  | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY"
  | "DC" | "PR" | "VI" | "GU";

/**
 * Core zero-knowledge proof structure
 */
export interface ZKProof {
  /** Schema version */
  version: string;

  /** zkPass schema ID (from DevHub) */
  schema_id: string;

  /** Type of verification method used */
  proof_type: ProofType;

  /** List of assertions that passed validation */
  assertions_passed: string[];

  /** Base64-encoded cryptographic proof data */
  proof_data: string;

  /** Unix timestamp when proof was generated */
  generated_at: number;

  /** Unix timestamp when proof expires (typically 90 days from generation) */
  expires_at: number;

  /** Unique nonce to prevent replay attacks */
  nonce: string;

  /** ECDSA signature over proof data */
  signature: string;
}

/**
 * Proof validation result returned by API
 */
export interface ProofValidationResult {
  /** Whether the proof is valid */
  verified: boolean;

  /** Type of proof that was validated */
  proof_type: ProofType;

  /** Timestamp when verification occurred */
  verified_at: string; // ISO 8601 format

  /** Timestamp when proof expires */
  expires_at: string; // ISO 8601 format

  /** Confidence score (0.0 - 1.0) based on proof strength */
  confidence_score: number;

  /** Unique ID for this verification event */
  verification_id: string;

  /** Optional error message if verification failed */
  error?: string;

  /** Additional metadata about the verification */
  metadata?: {
    /** Method-specific details */
    proof_method?: string;

    /** Device fingerprint hash (for fraud detection) */
    device_id?: string;

    /** Number of times this proof has been used */
    reuse_count?: number;

    /** Whether this is a duplicate proof submission */
    is_duplicate?: boolean;
  };
}

/**
 * Assertion definitions for US Passport verification
 */
export interface PassportAssertions {
  document_type: "US_PASSPORT";
  citizenship: "USA";
  document_status: "VALID" | "EXPIRED" | "REVOKED";
  expiration_date: number; // Unix timestamp
  holder_age: number;
}

/**
 * Assertion definitions for State ID / Driver's License verification
 */
export interface StateIDAssertions {
  document_type: "DRIVERS_LICENSE" | "STATE_ID";
  issuing_state: USState;
  document_status: "VALID" | "EXPIRED" | "SUSPENDED" | "REVOKED";
  expiration_date: number; // Unix timestamp
  address_state: USState;
  holder_age: number;
}

/**
 * Assertion definitions for SSN + Address verification
 */
export interface SSNAddressAssertions {
  ssn_issued: boolean;
  ssn_valid: boolean;
  address_deliverable: boolean;
  address_country: "USA";
  address_residential: boolean;
}

/**
 * Assertion definitions for Bank Account verification
 */
export interface BankAccountAssertions {
  account_status: "ACTIVE" | "CLOSED" | "FROZEN";
  account_country: "USA";
  account_type: "CHECKING" | "SAVINGS" | "MONEY_MARKET";
  routing_number_country: "USA";
  account_age_days: number;
}

/**
 * Schema metadata configuration
 */
export interface SchemaMetadata {
  schema_name: string;
  schema_version: string;
  description: string;
  category: "Identity/KYC";
  issuer: string;
  valid_duration_days: number;
}

/**
 * API request for proof verification
 */
export interface VerifyRequest {
  /** Applicant's unique ID */
  applicant_id: string;

  /** Base64-encoded zkPass proof */
  proof: string;

  /** Employer/recruiter unique ID */
  employer_id: string;

  /** Optional job posting ID for tracking */
  job_id?: string;

  /** Optional device fingerprint for fraud detection */
  device_fingerprint?: string;
}

/**
 * API response for proof verification
 */
export interface VerifyResponse extends ProofValidationResult {}

/**
 * Error codes for proof validation failures
 */
export enum ProofValidationError {
  EXPIRED = "PROOF_EXPIRED",
  INVALID_SIGNATURE = "INVALID_SIGNATURE",
  MALFORMED_PROOF = "MALFORMED_PROOF",
  SCHEMA_MISMATCH = "SCHEMA_MISMATCH",
  REPLAY_ATTACK = "REPLAY_ATTACK",
  DUPLICATE_PROOF = "DUPLICATE_PROOF",
  INSUFFICIENT_ASSERTIONS = "INSUFFICIENT_ASSERTIONS",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * Proof validation exception
 */
export class ProofValidationException extends Error {
  constructor(
    public code: ProofValidationError,
    public details?: string
  ) {
    super(`Proof validation failed: ${code}${details ? ` - ${details}` : ''}`);
    this.name = 'ProofValidationException';
  }
}

/**
 * zkPass configuration
 */
export interface ZKPassConfig {
  /** Application ID from zkPass DevHub */
  app_id: string;

  /** Schema ID from zkPass DevHub */
  schema_id: string;

  /** zkPass API endpoint (production or sandbox) */
  api_endpoint: string;

  /** Proof expiration duration in days */
  proof_ttl_days: number;
}

/**
 * Default zkPass configuration
 */
export const DEFAULT_ZKPASS_CONFIG: Partial<ZKPassConfig> = {
  api_endpoint: "https://api.zkpass.org/v1",
  proof_ttl_days: 90
};
