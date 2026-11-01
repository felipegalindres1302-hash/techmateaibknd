import { Router } from 'express';
import { submitAnswer } from '../controllers/exercise.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:id/submit', protect, submitAnswer);

export default router;

