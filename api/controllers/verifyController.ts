import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../../lib/db';
import { getZkPassConfig, verifyZkPassProof } from '../../lib/zkpass';
import type { Result } from '@zkpass/transgate-js-sdk/lib/types';

// Validation schemas
const ProofSubmissionSchema = z.object({
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
  metadata: z.object({
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    email: z.string().email().optional(),
    deviceId: z.string().optional(),
    ipAddress: z.string().optional(),
  }).optional()
});

const ProofReuseSchema = z.object({
  applicantId: z.string().uuid(),
  jobId: z.string(),
  employerId: z.string().optional()
});

class VerifyController {
  // Submit new ZK proof
  async submitProof(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const validationResult = ProofSubmissionSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new AppError('Invalid request data', 400, {
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { proof, metadata } = validationResult.data;

      // Extract email from metadata or use recipient from proof
      const email = metadata?.email || proof.recipient;
      if (!email) {
        throw new AppError('Email is required for verification', 400, {
          hint: 'Please provide an email address in the metadata or proof recipient field',
        });
      }

      // Validate email format
      if (!z.string().email().safeParse(email).success) {
        throw new AppError('Invalid email format', 400, {
          hint: 'Please provide a valid email address',
        });
      }

      // TODO: Validate ZK proof with zkPass validator
      if (!proof.taskId || !proof.validatorSignature || !proof.uHash) {
        throw new AppError('Invalid proof structure', 400, {
          hint: 'The proof is missing required fields. Please generate a new proof.',
        });
      }

      // Enforce cryptographic proof validation (defense in depth).
      // Client validates first, but server must always re-validate.
      let schemaId: string;
      try {
        schemaId = getZkPassConfig().schemaId;
      } catch (configError) {
        throw new AppError('Verification service unavailable', 503, {
          hint: 'zkPass is not configured on the server',
          message: configError instanceof Error ? configError.message : 'Missing zkPass configuration',
        });
      }

      const isProofValid = await verifyZkPassProof(
        proof as Result,
        schemaId,
        'evm'
      );

      if (!isProofValid) {
        throw new AppError('Invalid proof signature', 400, {
          hint: 'Proof could not be cryptographically validated. Please generate a new proof.',
        });
      }

      // Serialize proof for storage
      const proofData = JSON.stringify(proof);
      const proofHash = proof.uHash; // Use uHash as unique identifier

      // Check for existing applicant
      let applicant;
      try {
        applicant = await db.query(
          'SELECT id, email FROM applicants WHERE email = $1',
          [email]
        );
      } catch (dbError) {
        console.error('Database error checking applicant:', dbError);
        throw new AppError('Database error', 500, {
          hint: 'Failed to check applicant records. Please try again.',
        });
      }

      let applicantId: string;

      if (applicant.rows.length === 0) {
        // Create new applicant
        try {
          const newApplicant = await db.query(
            'INSERT INTO applicants (id, email, created_at) VALUES ($1, $2, NOW()) RETURNING id',
            [uuidv4(), email]
          );
          applicantId = newApplicant.rows[0].id;
        } catch (dbError) {
          console.error('Database error creating applicant:', dbError);
          throw new AppError('Database error', 500, {
            hint: 'Failed to create applicant record. Please try again.',
          });
        }
      } else {
        applicantId = applicant.rows[0].id;
      }

      // Check for duplicate proof using uHash
      let duplicateCheck;
      try {
        duplicateCheck = await db.query(
          'SELECT is_duplicate_proof($1) as is_duplicate',
          [proofHash]
        );
      } catch (dbError) {
        console.error('Database error checking duplicate:', dbError);
        throw new AppError('Database error', 500, {
          hint: 'Failed to check for duplicate proofs. Please try again.',
        });
      }

      if (duplicateCheck.rows[0].is_duplicate) {
        // Log fraud alert
        try {
          await db.query(
            `INSERT INTO fraud_alerts
             (id, applicant_id, alert_type, severity, description, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              uuidv4(),
              applicantId,
              'duplicate_proof',
              'high',
              `Duplicate proof detected - proof hash ${proofHash} already used`
            ]
          );
        } catch (dbError) {
          console.error('Failed to log fraud alert:', dbError);
          // Continue - don't fail the request if fraud logging fails
        }

        throw new AppError('Duplicate proof detected', 400, {
          reason: 'This proof has already been used by another applicant',
          hint: 'Each proof can only be used once. Please generate a new proof.',
        });
      }

      // Store proof (encrypted)
      const proofId = uuidv4();
      const encryptedProofData = db.encryptProof(proofData);

      try {
        await db.query(
          `INSERT INTO proofs
           (
             id, applicant_id, proof_data, proof_hash, proof_type, data_source,
             verified_at, expires_at, confidence_score, ip_address, user_agent, metadata
           )
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '90 days', $7, $8, $9, $10)`,
          [
            proofId,
            applicantId,
            encryptedProofData,
            proofHash,
            'zkpass',
            'zkpass',
            0.95,
            metadata?.ipAddress || req.ip,
            req.headers['user-agent'] || 'unknown',
            JSON.stringify({
              taskId: proof.taskId,
              companyName: metadata?.companyName,
              jobTitle: metadata?.jobTitle,
            }),
          ]
        );
      } catch (dbError) {
        console.error('Database error storing proof:', dbError);
        throw new AppError('Database error', 500, {
          hint: 'Failed to store proof. Please try again.',
        });
      }

      // Update applicant last_verified_at
      try {
        await db.query(
          'UPDATE applicants SET last_verified_at = NOW() WHERE id = $1',
          [applicantId]
        );
      } catch (dbError) {
        console.error('Failed to update applicant timestamp:', dbError);
        // Continue - don't fail the request if timestamp update fails
      }

      // Log audit event
      try {
        await db.query(
          `INSERT INTO audit_logs
           (id, user_id, user_type, action, resource_type, resource_id, ip_address, user_agent, status, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            uuidv4(),
            applicantId,
            'applicant',
            'proof_created',
            'proof',
            proofId,
            metadata?.ipAddress || req.ip,
            req.headers['user-agent'] || 'unknown',
            'success',
            JSON.stringify({
              jobTitle: metadata?.jobTitle,
              companyName: metadata?.companyName,
              taskId: proof.taskId
            })
          ]
        );
      } catch (dbError) {
        console.error('Failed to log audit event:', dbError);
        // Continue - don't fail the request if audit logging fails
      }

      res.status(201).json({
        success: true,
        verificationId: proofId, // Use proofId as verificationId
        applicantId,
        proofId,
        verified: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Verification successful'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Invalid request data', 400, error.issues));
      } else {
        next(error);
      }
    }
  }

  // Get verification status
  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { applicantId } = req.params;

      // Validate UUID
      if (!z.string().uuid().safeParse(applicantId).success) {
        throw new AppError('Invalid applicant ID', 400);
      }

      // Get active proof using database function
      const result = await db.query(
        `SELECT id, proof_type, verified_at, expires_at, confidence_score
         FROM proofs
         WHERE applicant_id = $1
           AND expires_at > NOW()
           AND is_revoked = FALSE
         ORDER BY verified_at DESC
         LIMIT 1`,
        [applicantId]
      );

      if (result.rows.length === 0) {
        return res.json({
          verified: false,
          message: 'No active verification found'
        });
      }

      const proof = result.rows[0];

      res.json({
        verified: true,
        applicantId,
        proofType: proof.proof_type,
        verifiedAt: proof.verified_at,
        expiresAt: proof.expires_at,
        confidenceScore: proof.confidence_score
      });

    } catch (error) {
      next(error);
    }
  }

  // Reuse existing proof for new job application
  async reuseProof(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = ProofReuseSchema.parse(req.body);
      const { applicantId, jobId, employerId } = validated;

      // Get active proof
      const proofResult = await db.query(
        `SELECT id, expires_at
         FROM proofs
         WHERE applicant_id = $1
           AND expires_at > NOW()
           AND is_revoked = FALSE
         ORDER BY verified_at DESC
         LIMIT 1`,
        [applicantId]
      );

      if (proofResult.rows.length === 0) {
        return res.json({
          verified: false,
          needsReverify: true,
          message: 'No active verification found. Please verify again.'
        });
      }

      const proof = proofResult.rows[0];

      // Log verification event
      await db.query(
        `INSERT INTO verifications
         (id, applicant_id, employer_id, job_id, verified, verified_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          uuidv4(),
          applicantId,
          employerId || req.employerId,
          jobId,
          true
        ]
      );

      res.json({
        verified: true,
        reused: true,
        proofId: proof.id,
        expiresAt: proof.expires_at,
        message: 'Existing verification reused successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Invalid request data', 400, error.issues));
      } else {
        next(error);
      }
    }
  }

  // Get verification history
  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { applicantId } = req.params;

      if (!z.string().uuid().safeParse(applicantId).success) {
        throw new AppError('Invalid applicant ID', 400);
      }

      const history = await db.query(
        `SELECT
           v.id,
           v.job_id,
           v.verified,
           v.verified_at,
           e.company_name as employer_name
         FROM verifications v
         LEFT JOIN employers e ON v.employer_id = e.id
         WHERE v.applicant_id = $1
         ORDER BY v.verified_at DESC
         LIMIT 100`,
        [applicantId]
      );

      res.json({
        applicantId,
        history: history.rows
      });

    } catch (error) {
      next(error);
    }
  }
}

export const verifyController = new VerifyController();
