import { Router } from 'express';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/signup/student', authController.signupStudent);
router.post('/signup/college', authController.signupCollege);
router.post('/login', authController.login);

export default router;
