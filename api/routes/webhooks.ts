import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';

const router = Router();

// Greenhouse webhooks
router.post('/greenhouse', webhookController.greenhouse);

// Lever webhooks (future)
router.post('/lever', webhookController.lever);

export default router;
