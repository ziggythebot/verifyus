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
    res.json(session);
  } catch (error) {
    console.error('Failed to create verification session:', error);
    res.status(500).json({
      error: 'Failed to create verification session',
      message: error instanceof Error ? error.message : 'Unknown error',
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
        details: validationResult.error.issues,
      });
    }

    const { proof, schemaId, chainType = 'evm' } = validationResult.data;

    // Verify the proof
    const isValid = await verifyZkPassProof(
      proof as Result,
      schemaId,
      chainType as ChainType
    );

    if (!isValid) {
      return res.status(400).json({
        valid: false,
        error: 'Proof verification failed',
      });
    }

    // Extract public fields
    const publicFields = extractPublicFields(proof as Result);

    res.json({
      valid: true,
      publicFields,
    });
  } catch (error) {
    console.error('Proof verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error instanceof Error ? error.message : 'Unknown error',
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
