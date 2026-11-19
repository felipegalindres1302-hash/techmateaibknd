import { Router } from 'express';
import { getPublicSettings } from '../controllers/adminSettings.controller.js';

const router = Router();

router.get('/', getPublicSettings);

export default router;
