import { Router } from 'express';
import {
  getProgressSummary,
  getStreak,
  getLessonProgress,
} from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/summary', protect, getProgressSummary);
router.get('/streak', protect, getStreak);
router.get('/lesson/:lessonId', protect, getLessonProgress);
router.get('/lessons/:lessonId', protect, getLessonProgress);

export default router;
