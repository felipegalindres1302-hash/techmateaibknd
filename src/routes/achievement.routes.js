import { Router } from 'express';
import {
  getAchievements,
  getMyAchievements,
} from '../controllers/achievement.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getAchievements);
router.get('/mine', protect, getMyAchievements);
router.get('/me', protect, getMyAchievements);

export default router;
