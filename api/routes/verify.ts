import { Router } from 'express';
import { verifyController } from '../controllers/verifyController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Submit ZK proof for verification
router.post('/', optionalAuth, verifyController.submitProof);

// Check verification status
router.get('/:applicantId', optionalAuth, verifyController.getStatus);

// Reuse existing proof for new application
router.post('/reuse', optionalAuth, verifyController.reuseProof);

// Get applicant's verification history
router.get('/:applicantId/history', optionalAuth, verifyController.getHistory);

export default router;
