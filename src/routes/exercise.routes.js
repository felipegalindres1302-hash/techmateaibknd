import { Router } from 'express';
import { submitAnswer } from '../controllers/exercise.controller.js';
import { protect } from '../middleware/auth.js';
import { submitLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/:id/submit', protect, submitLimiter, submitAnswer);

export default router;

