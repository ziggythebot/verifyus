import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Get employer statistics
router.get('/stats', analyticsController.getStats);

// Get verification trends
router.get('/trends', analyticsController.getTrends);

// Get fraud alerts
router.get('/fraud-alerts', analyticsController.getFraudAlerts);

export default router;
