import { Router } from 'express';
import {
  getLessons,
  getLessonById,
  getLessonExercises,
} from '../controllers/lesson.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getLessons);
router.get('/:id', getLessonById);
router.get('/:id/exercises', protect, getLessonExercises);

export default router;

