/**
 * zkPass Type Definitions
 *
 * Re-export and extend types from @zkpass/transgate-js-sdk
 */

import type {
  Result as ZkPassResult,
  ChainType as ZkPassChainType,
  Task,
  TaskConfig,
  VerifyResult,
  ProofVerifyParams,
  EventDataType,
} from '@zkpass/transgate-js-sdk/lib/types';

export type {
  Result,
  ChainType,
  Task,
  TaskConfig,
  VerifyResult,
  ProofVerifyParams,
  EventDataType,
} from '@zkpass/transgate-js-sdk/lib/types';

/**
 * Verification request payload
 */
export interface VerificationRequest {
  proof: ZkPassResult;
  schemaId: string;
  chainType?: ZkPassChainType;
}

/**
 * Verification response
 */
export interface VerificationResponse {
  valid: boolean;
  publicFields?: any[];
  error?: string;
}

/**
 * US Residency Verification Public Fields
 * These are the expected fields from the zkPass schema
 */
export interface USResidencyFields {
  isUSResident: boolean;
  state?: string;
  verificationDate: string;
}

/**
 * zkPass Session Configuration
 */
export interface ZkPassSession {
  appId: string;
  schemaId: string;
}
