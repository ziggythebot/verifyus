import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import db from '../../lib/db';

class WebhookController {
  // Greenhouse webhook handler
  async greenhouse(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, payload } = req.body;

      // Log webhook event
      await db.query(
        `INSERT INTO webhook_events
         (id, source, event_type, payload, processed, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), 'greenhouse', action, JSON.stringify(payload), false]
      );

      // Handle candidate.created event
      if (action === 'candidate_created') {
        const { candidate_id, email } = payload;

        if (!email) {
          throw new AppError('Email not found in payload', 400);
        }

        // Check if applicant has active proof
        const applicant = await db.query(
          'SELECT id FROM applicants WHERE email = $1',
          [email]
        );

        if (applicant.rows.length === 0) {
          // No verification found - flag in Greenhouse
          // TODO: Implement Greenhouse API call to reject/flag candidate
          console.log(`[Greenhouse] No verification for ${email} - would flag candidate ${candidate_id}`);

          return res.json({
            success: true,
            action: 'flagged',
            message: 'Candidate flagged - no verification found'
          });
        }

        const applicantId = applicant.rows[0].id;

        // Check for active proof
        const proofResult = await db.query(
          'SELECT * FROM get_active_proof($1)',
          [applicantId]
        );

        if (proofResult.rows.length === 0) {
          // Expired verification - reject in Greenhouse
          console.log(`[Greenhouse] Expired verification for ${email} - would reject candidate ${candidate_id}`);

          return res.json({
            success: true,
            action: 'rejected',
            message: 'Candidate rejected - verification expired'
          });
        }

        // Active verification found - update Greenhouse
        console.log(`[Greenhouse] Active verification for ${email} - would update candidate ${candidate_id}`);

        // Log successful verification
        await db.query(
          `INSERT INTO verifications
           (id, applicant_id, job_id, verified, verified_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [uuidv4(), applicantId, candidate_id, true]
        );

        return res.json({
          success: true,
          action: 'approved',
          message: 'Candidate verified successfully'
        });
      }

      res.json({ success: true, message: 'Webhook received' });

    } catch (error) {
      next(error);
    }
  }

  // Lever webhook handler (future)
  async lever(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement Lever webhook handling
      res.status(501).json({
        error: 'Not Implemented',
        message: 'Lever integration coming soon'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const webhookController = new WebhookController();
