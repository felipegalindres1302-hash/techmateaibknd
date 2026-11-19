import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/adminStats.controller.js';
import {
  getAdminLessons,
  getAdminLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  publishLesson,
  reorderLessons,
} from '../controllers/adminLesson.controller.js';
import {
  getAdminLessonExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  publishExercise,
  reorderExercises,
} from '../controllers/adminExercise.controller.js';
import {
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  publishAchievement,
} from '../controllers/adminAchievement.controller.js';
import {
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/adminSettings.controller.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);

router.get('/lessons', getAdminLessons);
router.post('/lessons', createLesson);
router.patch('/lessons/reorder', reorderLessons);

router.get('/lessons/:id', getAdminLesson);
router.patch('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);
router.patch('/lessons/:id/publish', publishLesson);

router.get('/lessons/:lessonId/exercises', getAdminLessonExercises);
router.post('/lessons/:lessonId/exercises', createExercise);
router.patch(
  '/lessons/:lessonId/exercises/reorder',
  reorderExercises
);

router.patch('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);
router.patch('/exercises/:id/publish', publishExercise);

router.get('/achievements', getAdminAchievements);
router.post('/achievements', createAchievement);
router.patch('/achievements/:id', updateAchievement);
router.delete('/achievements/:id', deleteAchievement);
router.patch('/achievements/:id/publish', publishAchievement);

router.get('/settings', getAdminSettings);
router.patch('/settings', updateAdminSettings);

export default router;
