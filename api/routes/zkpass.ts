/**
 * zkPass Verification Routes
 *
 * API endpoints for zkPass proof verification and session management
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  verifyZkPassProof,
  extractPublicFields,
  createVerificationSession,
} from '../../lib/zkpass';
import type { Result, ChainType } from '@zkpass/transgate-js-sdk/lib/types';

const router = Router();

// Validation schema for verification request
const verificationRequestSchema = z.object({
  proof: z.object({
    allocatorAddress: z.string(),
    allocatorSignature: z.string(),
    publicFields: z.array(z.any()),
    publicFieldsHash: z.string(),
    taskId: z.string(),
    uHash: z.string(),
    validatorAddress: z.string(),
    validatorSignature: z.string(),
    recipient: z.string().optional(),
  }),
  schemaId: z.string(),
  chainType: z.enum(['evm', 'sol', 'ton']).optional(),
});

/**
 * GET /api/zkpass/session
 *
 * Get zkPass session configuration for client-side verification
 */
router.get('/session', async (req: Request, res: Response) => {
  try {
    const session = createVerificationSession();

    // Validate session has required fields
    if (!session.appId || !session.schemaId) {
      throw new Error('zkPass is not properly configured. Missing APP_ID or SCHEMA_ID.');
    }

    res.json(session);
  } catch (error) {
    console.error('Failed to create verification session:', error);
    res.status(500).json({
      error: 'Failed to create verification session',
      message: error instanceof Error ? error.message : 'Unknown error',
      details:
        error instanceof Error && error.message.includes('configured')
          ? 'Please ensure ZKPASS_APP_ID and ZKPASS_SCHEMA_ID are set in environment variables'
          : undefined,
    });
  }
});

/**
 * POST /api/zkpass/verify
 *
 * Verify a zkPass proof
 *
 * Request body:
 * {
 *   proof: Result,
 *   schemaId: string,
 *   chainType?: 'evm' | 'sol' | 'ton'
 * }
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = verificationRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'The proof data provided is invalid or incomplete',
        details: validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { proof, schemaId, chainType = 'evm' } = validationResult.data;

    // Additional validation
    if (!proof.taskId || !proof.validatorSignature || !proof.uHash) {
      return res.status(400).json({
        error: 'Invalid proof structure',
        message: 'The proof is missing required fields (taskId, validatorSignature, or uHash)',
      });
    }

    // Verify the proof
    let isValid: boolean;
    try {
      isValid = await verifyZkPassProof(
        proof as Result,
        schemaId,
        chainType as ChainType
      );
    } catch (verifyError) {
      console.error('zkPass verification error:', verifyError);
      return res.status(500).json({
        valid: false,
        error: 'Proof verification service failed',
        message:
          verifyError instanceof Error
            ? verifyError.message
            : 'Failed to communicate with zkPass verification service',
      });
    }

    if (!isValid) {
      return res.status(400).json({
        valid: false,
        error: 'Proof verification failed',
        message: 'The proof could not be verified. It may be invalid, expired, or tampered with.',
      });
    }

    // Extract public fields
    const publicFields = extractPublicFields(proof as Result);

    res.json({
      valid: true,
      publicFields,
      message: 'Proof verified successfully',
    });
  } catch (error) {
    console.error('Proof verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred during verification',
    });
  }
});

/**
 * GET /api/zkpass/health
 *
 * Health check endpoint to verify zkPass configuration
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const hasAppId = !!process.env.ZKPASS_APP_ID;
    const hasSchemaId = !!process.env.ZKPASS_SCHEMA_ID;

    const isConfigured = hasAppId && hasSchemaId;

    res.json({
      configured: isConfigured,
      appId: hasAppId ? 'set' : 'missing',
      schemaId: hasSchemaId ? 'set' : 'missing',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
