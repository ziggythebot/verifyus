/**
 * zkPass TransGate SDK Integration
 *
 * This module provides server-side utilities for zkPass proof verification.
 */

import TransgateConnect from '@zkpass/transgate-js-sdk';
import type { Result, ChainType } from '@zkpass/transgate-js-sdk/lib/types';

/**
 * Initialize zkPass TransGate client
 */
export function createZkPassClient(appId: string): TransgateConnect {
  if (!appId) {
    throw new Error('zkPass App ID is required');
  }

  return new TransgateConnect(appId);
}

/**
 * Get zkPass configuration from environment
 */
export function getZkPassConfig() {
  const appId = process.env.ZKPASS_APP_ID;
  const schemaId = process.env.ZKPASS_SCHEMA_ID;

  if (!appId) {
    throw new Error('ZKPASS_APP_ID environment variable is not set');
  }

  if (!schemaId) {
    throw new Error('ZKPASS_SCHEMA_ID environment variable is not set');
  }

  return { appId, schemaId };
}

/**
 * Verify a zkPass proof result
 *
 * @param result - The proof result from TransGate
 * @param schemaId - The schema ID used for verification
 * @param chainType - The blockchain type (default: 'evm')
 * @returns boolean indicating if the proof is valid
 */
export async function verifyZkPassProof(
  result: Result,
  schemaId: string,
  chainType: ChainType = 'evm'
): Promise<boolean> {
  const { appId } = getZkPassConfig();
  const client = createZkPassClient(appId);

  try {
    return client.verifyProofMessageSignature(chainType, schemaId, result);
  } catch (error) {
    console.error('zkPass proof verification failed:', error);
    return false;
  }
}

/**
 * Extract public fields from zkPass proof result
 *
 * @param result - The proof result from TransGate
 * @returns The public fields array
 */
export function extractPublicFields(result: Result): any[] {
  return result.publicFields || [];
}

/**
 * Create verification session for client
 * This returns the configuration needed for client-side TransGate launch
 */
export function createVerificationSession() {
  const { appId, schemaId } = getZkPassConfig();

  return {
    appId,
    schemaId,
  };
}
