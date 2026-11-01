import { Router } from 'express';
import {
  register,
  login,
  createChild,
  getMe,
} from '../controllers/auth.controller.js';
import { protect, parentOnly } from '../middleware/auth.js';
import {
  registerRules,
  loginRules,
  createChildRules,
  validate,
} from '../middleware/validation.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/child', protect, parentOnly, createChildRules, validate, createChild);
router.post('/children', protect, parentOnly, createChildRules, validate, createChild);
router.get('/me', protect, getMe);

export default router;
