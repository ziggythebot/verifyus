import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import db from '../../lib/db';

class AnalyticsController {
  // Get employer statistics
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.employerId;

      if (!employerId) {
        throw new AppError('Employer ID not found', 401);
      }

      // Get verification stats
      const stats = await db.query(
        `SELECT
           COUNT(*) as total_verifications,
           COUNT(DISTINCT applicant_id) as unique_applicants,
           COUNT(*) FILTER (WHERE verified = true) as verified_count,
           COUNT(*) FILTER (WHERE verified = false) as rejected_count
         FROM verifications
         WHERE employer_id = $1`,
        [employerId]
      );

      // Get fraud alerts count
      const fraudAlerts = await db.query(
        `SELECT
           COUNT(*) as total_alerts,
           COUNT(*) FILTER (WHERE severity = 'high') as high_severity,
           COUNT(*) FILTER (WHERE severity = 'medium') as medium_severity,
           COUNT(*) FILTER (WHERE severity = 'low') as low_severity
         FROM fraud_alerts
         WHERE created_at > NOW() - INTERVAL '30 days'`
      );

      // Get active proofs count
      const activeProofs = await db.query(
        'SELECT COUNT(*) as count FROM active_proofs'
      );

      res.json({
        employerId,
        period: 'all_time',
        verifications: stats.rows[0],
        fraudAlerts: fraudAlerts.rows[0],
        activeProofs: parseInt(activeProofs.rows[0].count)
      });

    } catch (error) {
      next(error);
    }
  }

  // Get verification trends
  async getTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employerId = req.employerId;
      const rawDays = parseInt(req.query.days as string, 10);
      const days = Number.isNaN(rawDays) ? 30 : Math.min(Math.max(rawDays, 1), 365);

      if (!employerId) {
        throw new AppError('Employer ID not found', 401);
      }

      const trends = await db.query(
        `SELECT
           DATE(verified_at) as date,
           COUNT(*) as verifications,
           COUNT(*) FILTER (WHERE verified = true) as verified,
           COUNT(*) FILTER (WHERE verified = false) as rejected
         FROM verifications
         WHERE employer_id = $1
           AND verified_at > NOW() - ($2::int * INTERVAL '1 day')
         GROUP BY DATE(verified_at)
         ORDER BY date DESC`,
        [employerId, days]
      );

      res.json({
        employerId,
        period: `${days}_days`,
        trends: trends.rows
      });

    } catch (error) {
      next(error);
    }
  }

  // Get fraud alerts
  async getFraudAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rawLimit = parseInt(req.query.limit as string, 10);
      const limit = Number.isNaN(rawLimit) ? 100 : Math.min(Math.max(rawLimit, 1), 500);
      const severity = req.query.severity as string;

      let query = `
        SELECT
          fa.id,
          fa.applicant_id,
          fa.alert_type,
          fa.severity,
          fa.description,
          fa.created_at,
          a.email as applicant_email
        FROM fraud_alerts fa
        JOIN applicants a ON fa.applicant_id = a.id
        WHERE fa.created_at > NOW() - INTERVAL '90 days'
      `;

      const params: string[] = [];

      if (severity && ['low', 'medium', 'high', 'critical'].includes(severity)) {
        query += ' AND fa.severity = $1';
        params.push(severity);
      }

      query += ` ORDER BY fa.created_at DESC LIMIT ${limit}`;

      const alerts = await db.query(query, params);

      res.json({
        alerts: alerts.rows,
        count: alerts.rows.length
      });

    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
